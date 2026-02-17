import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
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
    const body = await req.json();
    const status = body.status || "GOING";

    if (!["GOING", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be GOING or CANCELLED" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Cannot RSVP to a cancelled or removed event" },
        { status: 400 }
      );
    }

    // Check capacity if RSVPing as GOING
    if (status === "GOING") {
      const goingCount = await prisma.rSVP.count({
        where: {
          eventId: id,
          status: "GOING",
          userId: { not: session.user.id }, // Exclude current user in case of update
        },
      });

      if (goingCount >= event.maxAttendees) {
        return NextResponse.json(
          { error: "This event is at full capacity" },
          { status: 400 }
        );
      }
    }

    // Create or update RSVP
    const rsvp = await prisma.rSVP.upsert({
      where: {
        eventId_userId: {
          eventId: id,
          userId: session.user.id,
        },
      },
      create: {
        eventId: id,
        userId: session.user.id,
        status: status as any,
      },
      update: {
        status: status as any,
      },
    });

    // Return RSVP + locationNotesPrivate (now visible since GOING)
    const response: any = { rsvp };
    if (status === "GOING") {
      response.locationNotesPrivate = event.locationNotesPrivate;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const rsvp = await prisma.rSVP.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: session.user.id,
        },
      },
    });

    if (!rsvp) {
      return NextResponse.json(
        { error: "RSVP not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.rSVP.update({
      where: {
        eventId_userId: {
          eventId: id,
          userId: session.user.id,
        },
      },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Cancel RSVP error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
