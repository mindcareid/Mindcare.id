import prisma from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";
import crypto from "crypto";
import z from "zod";

import { mailConfig, sendResetPasswordEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation Failed!",
          errors: z.treeifyError(parsed.error),
        },
        { status: 422 },
      );
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If this email exist, a reset link has been sent.",
      });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    const resetUrl = `${mailConfig.appUrl}/auth/reset-password?token=${token}`;
 
    await sendResetPasswordEmail({ to: user.email, name: user.name, resetUrl });
    return NextResponse.json({
      success: true,
      message: "If this email exists, a reset link has been start",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
