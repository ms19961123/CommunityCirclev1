import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();

    // --- activeFamilies: distinct users who RSVPed in last 7 days ---
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const recentRsvps = await prisma.rSVP.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      select: { userId: true },
    });

    const activeFamiliesSet = new Set(recentRsvps.map((r) => r.userId));
    const activeFamilies = activeFamiliesSet.size;

    // --- repeatAttendance: % of users with >1 RSVP in last 30 days ---
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const monthlyRsvps = await prisma.rSVP.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { userId: true },
    });

    const userRsvpCount: Record<string, number> = {};
    for (const rsvp of monthlyRsvps) {
      userRsvpCount[rsvp.userId] = (userRsvpCount[rsvp.userId] || 0) + 1;
    }

    const totalUsersWithRsvps = Object.keys(userRsvpCount).length;
    const repeatUsers = Object.values(userRsvpCount).filter((c) => c > 1).length;
    const repeatAttendance =
      totalUsersWithRsvps > 0
        ? Math.round((repeatUsers / totalUsersWithRsvps) * 100)
        : 0;

    // --- averageRating: average of all feedback ratings ---
    const ratingAgg = await prisma.feedback.aggregate({
      _avg: {
        rating: true,
      },
    });

    const averageRating = ratingAgg._avg.rating
      ? Math.round(ratingAgg._avg.rating * 10) / 10
      : 0;

    // --- eventsThisWeek: count of events this week ---
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const eventsThisWeek = await prisma.event.count({
      where: {
        startAt: {
          gte: weekStart,
          lt: weekEnd,
        },
        status: "ACTIVE",
      },
    });

    // --- eventsPerDay: array of { date, count } for last 14 days of event creation ---
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const recentEvents = await prisma.event.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
      },
      select: { createdAt: true },
    });

    // Initialize all 14 days
    const eventsPerDay: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      eventsPerDay.push({ date: dateStr, count: 0 });
    }

    // Count events per day
    for (const event of recentEvents) {
      const dateStr = event.createdAt.toISOString().split("T")[0];
      const entry = eventsPerDay.find((e) => e.date === dateStr);
      if (entry) {
        entry.count++;
      }
    }

    return NextResponse.json({
      activeFamilies,
      repeatAttendance,
      averageRating,
      eventsThisWeek,
      eventsPerDay,
    });
  } catch (error) {
    console.error("Health analytics error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
