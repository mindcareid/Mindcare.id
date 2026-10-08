import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary/config";
import { FolderImage, isRoleAllowed } from "@/lib/cloudinary/folders";
import {
  UPLOAD_FOLDER_ENTITIES,
  UploadFolderImage,
} from "@/lib/cloudinary/types/upload";

/**
 * Server-controlled upload. Client mengirim file + entityType; folder,
 * resource_type, dan (opsional) penghapusan aset lama sepenuhnya ditentukan
 * server, sehingga tidak bisa ditimpa dari browser. Dipakai oleh form yang
 * memakai cropper/direct-upload (hero, about-section, whyus, categories,
 * user, event) yang tidak cocok dengan signature khusus-widget.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const entityType = form.get("entityType");
    const oldPublicId = form.get("oldPublicId");

    if (typeof entityType !== "string") {
      return NextResponse.json(
        { message: "entityType is required" },
        { status: 400 },
      );
    }

    const entities = UPLOAD_FOLDER_ENTITIES as readonly string[];
    if (!entities.includes(entityType)) {
      return NextResponse.json(
        { message: "Invalid entity type" },
        { status: 400 },
      );
    }

    const entity = entityType as UploadFolderImage;
    if (!isRoleAllowed(entity, session.user.role)) {
      return NextResponse.json(
        { message: "You cannot upload to this folder" },
        { status: 403 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "File is required" },
        { status: 400 },
      );
    }

    const { path: folder, resourceType = "image" } = FolderImage[entity];
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const dataUri = `data:${file.type || "application/octet-stream"};base64,${base64}`;

    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: resourceType,
      transformation: [
        {
          width: 1600,
          height: 1600,
          crop: "limit",
          fetch_format: "webp",
          quality: "auto:good",
        },
      ],
    });
    if (
      typeof oldPublicId === "string" &&
      oldPublicId &&
      oldPublicId !== uploaded.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: resourceType,
        });
      } catch (err) {
        console.error("[CLOUDINARY_UPLOAD_DESTROY_OLD]", err);
      }
    }

    return NextResponse.json({
      data: {
        secure_url: uploaded.secure_url,
        public_id: uploaded.public_id,
      },
    });
  } catch (err) {
    console.error("[CLOUDINARY_UPLOAD]", err);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
