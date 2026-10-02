import { cloudinary } from "./config";
import { FolderImage, isRoleAllowed } from "./folders";
import { UploadFolderImage, UploadSignatureResponse } from "./types/upload";

export type UploadSignatureErrorCode =
  | "FORBIDDEN_FOLDER"
  | "MISSING_CREDENTIALS";

export class UploadSignatureError extends Error {
  readonly code: UploadSignatureErrorCode;

  constructor(code: UploadSignatureErrorCode) {
    super(code);
    this.name = "UploadSignatureError";
    this.code = code;
  }
}

type SignParams = {
  entityType: UploadFolderImage;
  userRole: string | undefined;
};
export function createUploadSignature({
  entityType,
  userRole,
}: SignParams): UploadSignatureResponse {
  const config = FolderImage[entityType];
  if (!isRoleAllowed(entityType, userRole)) {
    throw new UploadSignatureError("FORBIDDEN_FOLDER");
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new UploadSignatureError("MISSING_CREDENTIALS");
  }

  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      source: "uw",
      folder: config.path,
    },
    apiSecret,
  );

  return {
    signature,
    timestamp,
    folder: config.path,
    apiKey,
    cloudName,
  };
}
