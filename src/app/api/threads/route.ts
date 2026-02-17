import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId query parameter is required" },
        { status: 400 }
      );
    }

    // Check that user is host or has GOING RSVP
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { hostUserId: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const isHost = event.hostUserId === session.user.id;

    if (!isHost) {
      const rsvp = await prisma.rSVP.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: session.user.id,
          },
        },
      });

      if (!rsvp || rsvp.status !== "GOING") {
        return NextResponse.json(
          { error: "You must be the host or have a GOING RSVP to view this thread" },
          { status: 403 }
        );
      }
    }

    const thread = await prisma.messageThread.findUnique({
      where: { eventId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startAt: true,
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ thread });
  } catch (error) {
    console.error("Get thread error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
