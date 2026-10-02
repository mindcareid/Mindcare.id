export const UPLOAD_FOLDER_ENTITIES = [
  "professionals",
  "users",
  "care-centre",
  "article",
  "solutions",
  "events",
  "categories",
  "hero",
  "about-section",
  "whyus",
] as const;

export type UploadFolderImage = (typeof UPLOAD_FOLDER_ENTITIES)[number];

/** Tipe resource Cloudinary yang diizinkan per entity. Default: "image". */
export type UploadResourceType = "image" | "video" | "raw" | "auto";

/** Hasil upload server-side (endpoint /api/cloudinary/upload). */
export interface ServerUploadResponse {
  secure_url: string;
  public_id: string;
}

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}
