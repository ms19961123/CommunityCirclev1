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

    // Find the thread and its associated event
    const thread = await prisma.messageThread.findUnique({
      where: { id },
      include: {
        event: {
          select: { hostUserId: true, id: true },
        },
      },
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    // Check that user is host or has GOING RSVP
    const isHost = thread.event.hostUserId === session.user.id;

    if (!isHost) {
      const rsvp = await prisma.rSVP.findUnique({
        where: {
          eventId_userId: {
            eventId: thread.event.id,
            userId: session.user.id,
          },
        },
      });

      if (!rsvp || rsvp.status !== "GOING") {
        return NextResponse.json(
          { error: "You must be the host or have a GOING RSVP to send messages" },
          { status: 403 }
        );
      }
    }

    const body = await req.json();

    if (!body.body || typeof body.body !== "string" || body.body.trim().length === 0) {
      return NextResponse.json(
        { error: "Message body cannot be empty" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        threadId: id,
        senderUserId: session.user.id,
        body: body.body.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
