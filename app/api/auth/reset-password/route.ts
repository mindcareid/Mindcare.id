import prisma from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import z from "zod";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    const { token, password, confirmPassword } = body as {
      token: string;
      password: string;
      confirmPassword: string;
    };

    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 },
      );
    }

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    // Cek token valid
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
      select: { id: true, email: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token is invalid or has expired" },
        { status: 400 },
      );
    }
    if (user.password) {
      const isSameAsCurrent = await bcrypt.compare(
        parsed.data.password,
        user.password,
      );

      if (isSameAsCurrent) {
        return NextResponse.json(
          {
            message:
              "New password must be different from your current password",
            code: "PASSWORD_REUSED",
          },
          { status: 422 },
        );
      }
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
