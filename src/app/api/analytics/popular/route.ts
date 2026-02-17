import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Calculate current week boundaries (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Get RSVPs for events happening this week, grouped by category
    const rsvps = await prisma.rSVP.findMany({
      where: {
        status: "GOING",
        event: {
          startAt: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
      },
      include: {
        event: {
          select: {
            category: true,
          },
        },
      },
    });

    // Group by category and count
    const categoryCountMap: Record<string, number> = {};
    for (const rsvp of rsvps) {
      const category = rsvp.event.category;
      categoryCountMap[category] = (categoryCountMap[category] || 0) + 1;
    }

    const popular = Object.entries(categoryCountMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ popular });
  } catch (error) {
    console.error("Popular analytics error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
