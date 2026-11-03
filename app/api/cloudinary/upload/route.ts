import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary/config";
import { FolderImage, isRoleAllowed } from "@/lib/cloudinary/folders";
import { resolveFolderRole } from "@/lib/adminAccess";
import {
  canDestroyPublicId,
  resourceTypeForPublicId,
} from "@/lib/cloudinary/asset";
import { safeFileName } from "@/lib/events/proposal";
import {
  UPLOAD_FOLDER_ENTITIES,
  UploadFolderImage,
} from "@/lib/cloudinary/types/upload";

const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
function hasPdfMagicBytes(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString("latin1") === "%PDF-";
}

function looksLikePdf(file: File, buffer: Buffer): boolean {
  const named = file.name.toLowerCase().endsWith(".pdf");
  const typed = file.type === "application/pdf";
  return hasPdfMagicBytes(buffer) && (named || typed);
}

async function uploadDocument({
  buffer,
  file,
  folder,
  oldPublicId,
  userRole,
}: {
  buffer: Buffer;
  file: File;
  folder: string;
  oldPublicId: FormDataEntryValue | null;
  userRole: string | undefined;
}) {
  const base64 = buffer.toString("base64");
  const dataUri = `data:application/pdf;base64,${base64}`;

  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "raw",
    format: "pdf",
    use_filename: true,
    unique_filename: true,
    filename_override: safeFileName(file.name.replace(/\.pdf$/i, "")),
  });

  await destroyReplacedAsset({
    newPublicId: uploaded.public_id,
    oldPublicId,
    userRole,
    folder,
  });

  return NextResponse.json({
    data: {
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
    },
  });
}
async function destroyReplacedAsset({
  newPublicId,
  oldPublicId,
  userRole,
  folder,
}: {
  newPublicId: string;
  oldPublicId: FormDataEntryValue | null;
  userRole: string | undefined;
  folder: string;
}) {
  if (
    typeof oldPublicId !== "string" ||
    !oldPublicId ||
    oldPublicId === newPublicId
  ) {
    return;
  }

  if (!canDestroyPublicId(oldPublicId, userRole)) {
    return;
  }
  if (!publicIdIsInFolder(oldPublicId, folder)) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(oldPublicId, {
      resource_type: resourceTypeForPublicId(oldPublicId),
    });
  } catch (err) {
    console.error("[CLOUDINARY_UPLOAD_DESTROY_OLD]", err);
  }
}

function publicIdIsInFolder(publicId: string, folder: string): boolean {
  const normalized = publicId.replace(/^\/+|\/+$/g, "");
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, "");
  return (
    normalized === normalizedFolder ||
    normalized.startsWith(`${normalizedFolder}/`)
  );
}

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
    if (!isRoleAllowed(entity, resolveFolderRole(session.user))) {
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
    if (resourceType === "raw") {
      if (file.size > MAX_DOCUMENT_BYTES) {
        return NextResponse.json(
          { message: "File is larger than 15 MB." },
          { status: 413 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (!looksLikePdf(file, buffer)) {
        return NextResponse.json(
          { message: "Only PDF files are allowed for this upload." },
          { status: 415 },
        );
      }

      return uploadDocument({
        buffer,
        file,
        folder,
        oldPublicId,
        userRole: resolveFolderRole(session.user),
      });
    }

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
    await destroyReplacedAsset({
      newPublicId: uploaded.public_id,
      oldPublicId,
      userRole: resolveFolderRole(session.user),
      folder,
    });

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
