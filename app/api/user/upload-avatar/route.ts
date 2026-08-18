import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { photo, publicId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 🔥 Jangan destroy kalau sama
    if (user.publicId && user.publicId !== publicId) {
      const destroyResult = await cloudinary.uploader.destroy(user.publicId, {
        resource_type: "image",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: {
        photo,
        publicId,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("ERROR UPDATE AVATAR:", error);
    return NextResponse.json({ message: "Update Failed" }, { status: 500 });
  }
}
