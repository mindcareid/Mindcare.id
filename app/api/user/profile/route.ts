import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { profileSchema } from "@/lib/validations/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validateData = profileSchema.parse(body);
    const userId = Number(session.user.id);

    const updateData = await prisma.user.update({
      where: { id: userId },
      data: {
        name: validateData.fullname,
        bio: validateData.bio,
        jobTitle: validateData.jobTitle,
        jobName: validateData.jobName,
        gender: validateData.gender,
      },
    });

    return NextResponse.json(
      {
        message: "profile update successfully",
        data: updateData,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Update Profile Error:", err);

    if (err.name === "ZodError") {
      return NextResponse.json(
        {
          message: "Invalid data validation zod erorr",
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
