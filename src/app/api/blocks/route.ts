import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    const { blockedUserId } = body;

    if (!blockedUserId || typeof blockedUserId !== "string") {
      return NextResponse.json(
        { error: "blockedUserId is required" },
        { status: 400 }
      );
    }

    if (blockedUserId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot block yourself" },
        { status: 400 }
      );
    }

    // Check that the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: blockedUserId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if block already exists
    const existingBlock = await prisma.block.findUnique({
      where: {
        blockerUserId_blockedUserId: {
          blockerUserId: session.user.id,
          blockedUserId,
        },
      },
    });

    if (existingBlock) {
      return NextResponse.json(
        { error: "You have already blocked this user" },
        { status: 409 }
      );
    }

    const block = await prisma.block.create({
      data: {
        blockerUserId: session.user.id,
        blockedUserId,
      },
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    console.error("Create block error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
