import { NextRequest, NextResponse } from "next/server";
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
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    if (code !== "123456") {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
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

    if (profile.phoneVerifiedAt) {
      return NextResponse.json(
        { error: "Phone is already verified" },
        { status: 400 }
      );
    }

    const now = new Date();
    const trustScore = computeTrustScore({
      emailVerifiedAt: profile.emailVerifiedAt,
      phoneVerifiedAt: now,
      idVerifiedAt: profile.idVerifiedAt,
    });

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        phoneVerifiedAt: now,
        trustScore,
      },
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("Phone verification error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
