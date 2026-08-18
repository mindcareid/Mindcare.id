import { sendContactNotification } from "@/lib/email";
import prisma from "@/lib/prisma";
import { contactUserSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    const parsed = contactUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation Failed!",
          errors: z.treeifyError(parsed.error),
        },
        { status: 422 },
      );
    }

    const { name, email, phoneNumber, Subject, Message } = parsed.data;
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        phoneNumber,
        subject: Subject,
        message: Message,
      },
    });

    sendContactNotification({
      name,
      email,
      phoneNumber,
      subject: Subject,
      message: Message,
    }).catch((err) => console.error("EMAIL ERROR", err));

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("CONTACT ERROR:", error);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 },
    );
  }
}
