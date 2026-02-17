import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { feedbackSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { eventId } = body;
    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { rating, tags } = parsed.data;

    // Check that the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check for existing feedback (unique per eventId + userId)
    const existingFeedback = await prisma.feedback.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: "You have already submitted feedback for this event" },
        { status: 409 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        eventId,
        userId: session.user.id,
        rating,
        tags,
      },
    });

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    console.error("Create feedback error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
