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

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const rsvp = await prisma.rSVP.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: session.user.id,
        },
      },
    });

    if (!rsvp || rsvp.status !== "GOING") {
      return NextResponse.json(
        { error: "You must have a GOING RSVP to check in" },
        { status: 400 }
      );
    }

    if (rsvp.checkedInAt) {
      return NextResponse.json(
        { error: "You have already checked in" },
        { status: 400 }
      );
    }

    const updatedRsvp = await prisma.rSVP.update({
      where: { id: rsvp.id },
      data: { checkedInAt: new Date() },
    });

    return NextResponse.json({ rsvp: updatedRsvp });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
