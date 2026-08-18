import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

//Destroy event image company
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }
  const { publicId } = await req.json();

  if (!publicId) {
    return NextResponse.json(
      { message: "Public Id Required" },
      { status: 400 },
    );
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    return NextResponse.json({ message: "Image Deleted" });
  } catch (err) {
    console.error("[DESTROY_IMAGE]", err);
    return NextResponse.json(
      { message: "Failed to delete image" },
      { status: 500 },
    );
  }
}
