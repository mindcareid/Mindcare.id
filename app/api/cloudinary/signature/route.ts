import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UploadSignatureSchema } from "@/lib/validations/upload";
import {
  createUploadSignature,
  UploadSignatureError,
} from "@/lib/cloudinary/signature";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UploadSignatureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid entity type", issue: parsed.error.issues },
        { status: 400 },
      );
    }

    const data = createUploadSignature({
      entityType: parsed.data.entityType,
      userRole: session.user.role,
    });
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof UploadSignatureError) {
      if (err.code === "FORBIDDEN_FOLDER") {
        return NextResponse.json(
          { message: "You cannot upload to this folder" },
          { status: 403 },
        );
      }
      console.error("[UPLOAD_SIGNATURE] missing Cloudinary credentials", err);
      return NextResponse.json(
        { message: "Upload is not configured on this server" },
        { status: 500 },
      );
    }

    console.error("Upload signature error:", err);
    return NextResponse.json(
      { message: "Failed to generate signature" },
      { status: 500 },
    );
  }
}
