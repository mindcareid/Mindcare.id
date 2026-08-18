import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { message: "Token is required!" },
        { status: 400 },
      );
    }
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: new Date() },
      },
      select: { id: true, email: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token is invalid or expired!" },
        { status: 400 },
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified." },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
        emailVerificationAttempts: 0,
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?verified=true`,
    );
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
