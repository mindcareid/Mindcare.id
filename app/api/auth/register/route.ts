import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { generateUniqueUsername } from "@/lib/utils/generateUsername";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";
import z from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: z.treeifyError(parsed.error) },
        { status: 400 },
      );
    }

    const { name, email, password, phoneNumber } = parsed.data;

    // cek email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 },
      );
    }

    // Check phone Number
    const exisitingPhoneNumber = await prisma.user.findUnique({
      where: { phonenumber: phoneNumber },
    });
    if (exisitingPhoneNumber) {
      return NextResponse.json(
        { message: "Phone Number already registered" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const username = await generateUniqueUsername(email);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        phonenumber: phoneNumber,
        role: "USER",
        photo: "",
        publicId: "",
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expired = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 jam

    await prisma.user.update({
      where: { id: newUser.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expired,
      },
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${token}`;

    sendVerificationEmail({
      to: newUser.email,
      name: newUser.name,
      verifyUrl,
    }).catch((err) => console.error("VERIFY EMAIL ERROR:", err));

    return NextResponse.json(
      {
        message:
          "Registration success. Please check your email to verify your account.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
