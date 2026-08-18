import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user.id) {
      return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        emailResendCooldown: true,
        emailVerificationAttempts: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified!" },
        { status: 400 },
      );
    }
    if (user.emailResendCooldown && user.emailResendCooldown > new Date()) {
      const secondLeft = Math.ceil(
        (user.emailResendCooldown.getTime() - Date.now()) / 1000,
      );

      return NextResponse.json(
        { message: `Please wait ${secondLeft} seconds before resending` },
        { status: 429 },
      );
    }

    if (user.emailVerificationAttempts >= 5) {
      return NextResponse.json(
        { message: "Too manny attempts. Please contact support." },
        { status: 429 },
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expired = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const cooldown = new Date(Date.now() + 1000 * 60 * 2);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expired,
        emailResendCooldown: cooldown,
        emailVerificationAttempts: { increment: 1 },
      },
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${token}`;

    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      verifyUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error("RESEND VERIFICATION ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
