import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

function computeTrustScore(profile: {
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  idVerifiedAt: Date | null;
}): number {
  let score = 0;
  if (profile.emailVerifiedAt) score += 10;
  if (profile.phoneVerifiedAt) score += 20;
  if (profile.idVerifiedAt) score += 30;
  return score;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Complete onboarding first." },
        { status: 404 }
      );
    }

    if (profile.emailVerifiedAt) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    const now = new Date();
    const trustScore = computeTrustScore({
      emailVerifiedAt: now,
      phoneVerifiedAt: profile.phoneVerifiedAt,
      idVerifiedAt: profile.idVerifiedAt,
    });

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        emailVerifiedAt: now,
        trustScore,
      },
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
