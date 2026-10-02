import { authOptions } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary/config";
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

    // Destroy avatar lama bersifat best-effort: kegagalan cleanup (mis. API key
    // di-disable atau publicId lama tidak ditemukan) tidak boleh menggagalkan
    // penggantian avatar, karena DB harus tetap ter-update ke foto baru.
    if (user.publicId && user.publicId !== publicId) {
      try {
        await cloudinary.uploader.destroy(user.publicId, {
          resource_type: "image",
        });
      } catch (err) {
        console.error("[AVATAR_DESTROY_OLD]", err);
      }
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
