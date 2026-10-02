import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary/config";
import { canDestroyPublicId } from "@/lib/cloudinary/asset";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const publicId: string | undefined = body?.public_id ?? body?.publicId;

  if (!publicId) {
    return NextResponse.json({ message: "Public Id Required" }, { status: 400 });
  }

  if (!canDestroyPublicId(publicId, session.user.role)) {
    return NextResponse.json(
      { message: "You cannot delete this asset" },
      { status: 403 },
    );
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    return NextResponse.json({ result });
  } catch (err) {
    console.error("[CLOUDINARY_DELETE]", err);
    return NextResponse.json(
      { message: "Failed to delete image" },
      { status: 500 },
    );
  }
}
