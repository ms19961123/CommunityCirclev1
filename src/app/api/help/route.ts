import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { helpRequestSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const body = await req.json();

    const parsed = helpRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    const helpRequest = await prisma.helpRequest.create({
      data: {
        userId: session?.user?.id ?? null,
        name,
        email,
        subject,
        message,
      },
    });

    return NextResponse.json({ helpRequest }, { status: 201 });
  } catch (error) {
    console.error("Help request error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
