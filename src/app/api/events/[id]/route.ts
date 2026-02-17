import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkContent } from "@/lib/moderation";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                trustScore: true,
                emailVerifiedAt: true,
                phoneVerifiedAt: true,
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
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if user has RSVP and their status
    let userRsvp = null;
    let showPrivateLocation = false;

    if (session?.user?.id) {
      userRsvp = await prisma.rSVP.findUnique({
        where: {
          eventId_userId: {
            eventId: id,
            userId: session.user.id,
          },
        },
      });

      // Show private location if user is host or has GOING RSVP
      showPrivateLocation =
        event.hostUserId === session.user.id ||
        (userRsvp?.status === "GOING");
    }

    // Build response, conditionally including locationNotesPrivate
    const { locationNotesPrivate, ...eventWithoutPrivate } = event;

    const response: any = {
      event: {
        ...eventWithoutPrivate,
        ...(showPrivateLocation && { locationNotesPrivate }),
      },
      rsvpCount: event._count.rsvps,
      ...(userRsvp && { userRsvp }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get event error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.hostUserId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the host can update this event" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Content moderation on updated title and description
    if (body.title) {
      const titleCheck = checkContent(body.title);
      if (titleCheck.blocked) {
        return NextResponse.json(
          { error: titleCheck.blockReason },
          { status: 400 }
        );
      }
      if (titleCheck.flagged && titleCheck.flagRule) {
        await prisma.flag.create({
          data: {
            targetType: "EVENT",
            targetId: id,
            rule: titleCheck.flagRule as any,
          },
        });
      }
    }

    if (body.description) {
      const descCheck = checkContent(body.description);
      if (descCheck.blocked) {
        return NextResponse.json(
          { error: descCheck.blockReason },
          { status: 400 }
        );
      }
      if (descCheck.flagged && descCheck.flagRule) {
        await prisma.flag.create({
          data: {
            targetType: "EVENT",
            targetId: id,
            rule: descCheck.flagRule as any,
          },
        });
      }
    }

    // Map indoorOutdoor "BOTH" to "MIXED" if present
    if (body.indoorOutdoor === "BOTH") {
      body.indoorOutdoor = "MIXED";
    }

    // Build update data from allowed fields
    const allowedFields = [
      "title",
      "description",
      "category",
      "startAt",
      "durationMins",
      "indoorOutdoor",
      "ageMin",
      "ageMax",
      "maxAttendees",
      "noDevices",
      "locationLabelPublic",
      "locationNotesPrivate",
      "lat",
      "lng",
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = field === "startAt" ? new Date(body[field]) : body[field];
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
