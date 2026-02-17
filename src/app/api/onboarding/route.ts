import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { onboardingSchema } from "@/lib/validations";

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

    // If this is just a settings update (has screenLightMode but no interests), skip full validation
    const isSettingsUpdate = body.screenLightMode !== undefined && !body.interests;

    if (!isSettingsUpdate) {
      const parsed = onboardingSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.errors[0].message },
          { status: 400 }
        );
      }
    }

    const { city, lat, lng, radiusMiles, interests, kidsAgeRanges, screenLightMode } = body;

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    const trustScore = computeTrustScore({
      emailVerifiedAt: existingProfile?.emailVerifiedAt ?? null,
      phoneVerifiedAt: existingProfile?.phoneVerifiedAt ?? null,
      idVerifiedAt: existingProfile?.idVerifiedAt ?? null,
    });

    const updateData: Record<string, unknown> = { trustScore };
    if (city !== undefined) updateData.city = city;
    if (lat !== undefined) updateData.lat = lat;
    if (lng !== undefined) updateData.lng = lng;
    if (radiusMiles !== undefined) updateData.radiusMiles = radiusMiles;
    if (interests !== undefined) updateData.interests = interests;
    if (kidsAgeRanges !== undefined) updateData.kidsAgeRanges = kidsAgeRanges;
    if (screenLightMode !== undefined) updateData.screenLightMode = screenLightMode;

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        city: city || "Unknown",
        lat: lat || 0,
        lng: lng || 0,
        radiusMiles: radiusMiles || 5,
        interests: interests || [],
        kidsAgeRanges: kidsAgeRanges || [],
        screenLightMode: screenLightMode || false,
        trustScore,
      },
      update: updateData,
    });

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
