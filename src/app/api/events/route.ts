import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createEventSchema } from "@/lib/validations";
import { checkContent } from "@/lib/moderation";
import { getBoundingBox, haversineDistance } from "@/lib/geo";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    const myEvents = searchParams.get("myEvents");

    // If myEvents=true, return events the user hosts or has RSVPed to
    if (myEvents === "true" && session?.user?.id) {
      const events = await prisma.event.findMany({
        where: {
          OR: [
            { hostUserId: session.user.id },
            { rsvps: { some: { userId: session.user.id, status: "GOING" } } },
          ],
          status: "ACTIVE",
        },
        include: {
          host: {
            select: { id: true, name: true, profile: { select: { trustScore: true } } },
          },
          _count: { select: { rsvps: { where: { status: "GOING" } } } },
        },
        orderBy: { startAt: "asc" },
        take: 20,
      });
      return NextResponse.json(events);
    }

    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const radiusMiles = parseFloat(searchParams.get("radiusMiles") || "10");
    const category = searchParams.get("category");
    const startAfter = searchParams.get("startAfter");
    const startBefore = searchParams.get("startBefore");
    const ageMin = searchParams.get("ageMin");
    const ageMax = searchParams.get("ageMax");
    const indoorOutdoor = searchParams.get("indoorOutdoor");
    const noDevices = searchParams.get("noDevices");
    const tab = searchParams.get("tab") || "nearby";

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "lat and lng query parameters are required" },
        { status: 400 }
      );
    }

    // Bounding box prefilter
    const bbox = getBoundingBox(lat, lng, radiusMiles);

    // Get blocked user IDs for current user (both directions)
    let blockedUserIds: string[] = [];
    if (session?.user?.id) {
      const blocks = await prisma.block.findMany({
        where: {
          OR: [
            { blockerUserId: session.user.id },
            { blockedUserId: session.user.id },
          ],
        },
        select: {
          blockerUserId: true,
          blockedUserId: true,
        },
      });

      const idSet = new Set<string>();
      for (const block of blocks) {
        if (block.blockerUserId !== session.user.id) {
          idSet.add(block.blockerUserId);
        }
        if (block.blockedUserId !== session.user.id) {
          idSet.add(block.blockedUserId);
        }
      }
      blockedUserIds = Array.from(idSet);
    }

    // Build where clause
    const where: Prisma.EventWhereInput = {
      lat: { gte: bbox.minLat, lte: bbox.maxLat },
      lng: { gte: bbox.minLng, lte: bbox.maxLng },
      status: { notIn: ["CANCELLED", "REMOVED"] },
      ...(blockedUserIds.length > 0 && {
        hostUserId: { notIn: blockedUserIds },
      }),
      ...(category && { category: category as any }),
      ...(startAfter && { startAt: { gte: new Date(startAfter) } }),
      ...(startBefore && {
        startAt: {
          ...(startAfter ? { gte: new Date(startAfter) } : {}),
          lte: new Date(startBefore),
        },
      }),
      ...(ageMin && { ageMax: { gte: parseInt(ageMin) } }),
      ...(ageMax && { ageMin: { lte: parseInt(ageMax) } }),
      ...(indoorOutdoor && { indoorOutdoor: indoorOutdoor as any }),
      ...(noDevices === "true" && { noDevices: true }),
    };

    // For "foryou" tab, filter by user interests
    if (tab === "foryou" && session?.user?.id) {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { interests: true },
      });
      if (profile?.interests && profile.interests.length > 0) {
        // Map interests to event categories
        where.category = { in: profile.interests as any[] };
      }
    }

    let orderBy: Prisma.EventOrderByWithRelationInput = { startAt: "asc" };

    // Fetch events with host info and RSVP counts
    const events = await prisma.event.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                trustScore: true,
              },
            },
          },
        },
        _count: {
          select: {
            rsvps: {
              where: { status: "GOING" },
            },
          },
        },
      },
      orderBy,
    });

    // Apply haversine distance filter and compute distances
    let results = events
      .map((event) => {
        const distance = haversineDistance(lat, lng, event.lat, event.lng);
        return { ...event, distance };
      })
      .filter((event) => event.distance <= radiusMiles);

    // Sort based on tab
    if (tab === "popular") {
      results.sort((a, b) => b._count.rsvps - a._count.rsvps);
    } else {
      // "nearby" and "foryou" sort by distance
      results.sort((a, b) => a.distance - b.distance);
    }

    // Strip locationNotesPrivate from response
    const sanitizedResults = results.map(
      ({ locationNotesPrivate, ...rest }) => rest
    );

    return NextResponse.json({ events: sanitizedResults });
  } catch (error) {
    console.error("List events error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check email verification
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Complete onboarding first." },
        { status: 404 }
      );
    }

    if (!profile.emailVerifiedAt) {
      return NextResponse.json(
        { error: "Email verification required to create events" },
        { status: 403 }
      );
    }

    // Rate limiting based on verification status
    if (session.user.role !== "ADMIN") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const eventsToday = await prisma.event.count({
        where: {
          hostUserId: session.user.id,
          createdAt: { gte: todayStart },
        },
      });

      const maxEventsPerDay = profile.phoneVerifiedAt ? 3 : 1;

      if (eventsToday >= maxEventsPerDay) {
        return NextResponse.json(
          {
            error: `You can create at most ${maxEventsPerDay} event(s) per day. ${
              !profile.phoneVerifiedAt
                ? "Verify your phone to increase your limit."
                : ""
            }`,
          },
          { status: 429 }
        );
      }
    }

    const body = await req.json();

    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Content moderation on title and description
    const titleCheck = checkContent(data.title);
    if (titleCheck.blocked) {
      return NextResponse.json(
        { error: titleCheck.blockReason },
        { status: 400 }
      );
    }

    const descCheck = checkContent(data.description);
    if (descCheck.blocked) {
      return NextResponse.json(
        { error: descCheck.blockReason },
        { status: 400 }
      );
    }

    // Map "BOTH" from schema to "MIXED" in Prisma enum
    const indoorOutdoor =
      data.indoorOutdoor === "BOTH" ? "MIXED" : data.indoorOutdoor;

    // Create event
    const event = await prisma.event.create({
      data: {
        hostUserId: session.user.id,
        title: data.title,
        description: data.description,
        category: data.category as any,
        startAt: data.startAt,
        durationMins: data.durationMins,
        indoorOutdoor: indoorOutdoor as any,
        ageMin: data.ageMin,
        ageMax: data.ageMax,
        maxAttendees: data.maxAttendees,
        noDevices: data.noDevices,
        locationLabelPublic: data.locationLabelPublic,
        locationNotesPrivate: data.locationNotesPrivate || "",
        lat: data.lat,
        lng: data.lng,
      },
    });

    // Create message thread for the event
    await prisma.messageThread.create({
      data: {
        eventId: event.id,
      },
    });

    // Create flag records if content was flagged (but allow creation)
    if (titleCheck.flagged && titleCheck.flagRule) {
      await prisma.flag.create({
        data: {
          targetType: "EVENT",
          targetId: event.id,
          rule: titleCheck.flagRule as any,
        },
      });
    }

    if (descCheck.flagged && descCheck.flagRule) {
      await prisma.flag.create({
        data: {
          targetType: "EVENT",
          targetId: event.id,
          rule: descCheck.flagRule as any,
        },
      });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
