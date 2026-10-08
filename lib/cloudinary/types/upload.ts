export const UPLOAD_FOLDER_ENTITIES = [
  "professionals",
  "users",
  "care-centre",
  "article",
  "solutions",
  "events",
  "companies",
  "categories",
  "hero",
  "about-section",
  "whyus",
] as const;

export type UploadFolderImage = (typeof UPLOAD_FOLDER_ENTITIES)[number];
export type UploadResourceType = "image" | "video" | "raw" | "auto";
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
