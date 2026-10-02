import {
  FolderImage,
  isRoleAllowed,
  LEGACY_DELETE_ONLY_FOLDERS,
  roleIsInList,
} from "./folders";
import { UPLOAD_FOLDER_ENTITIES, UploadFolderImage } from "./types/upload";

const CLOUDINARY_HOST = "res.cloudinary.com";

function cloudName(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  return raw ? raw : undefined;
}
const IMAGE_RESOURCE_TYPES = new Set(["image", "images"]);

export function isCloudinaryAssetUrl(url: string): boolean {
  const name = cloudName();
  if (!name) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== CLOUDINARY_HOST) {
    return false;
  }
  const segments = decodedSegments(parsed.pathname);
  if (segments.length < 3) return false;
  if (segments[0] !== name) return false;
  return IMAGE_RESOURCE_TYPES.has(segments[1]);
}

function decodedSegments(pathname: string): string[] {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });
}
export function isPublicIdInEntityFolder(
  publicId: string,
  entityType: UploadFolderImage,
): boolean {
  return publicIdBelongsToFolder(publicId, FolderImage[entityType].path);
}

function publicIdBelongsToFolder(publicId: string, folder: string): boolean {
  const normalized = publicId.replace(/^\/+|\/+$/g, "");
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, "");
  return (
    normalized === normalizedFolder ||
    normalized.startsWith(`${normalizedFolder}/`)
  );
}
export function canDestroyPublicId(
  publicId: string,
  userRole: string | undefined,
): boolean {
  const inEntityFolder = UPLOAD_FOLDER_ENTITIES.some(
    (entity) =>
      isRoleAllowed(entity, userRole) &&
      publicIdBelongsToFolder(publicId, FolderImage[entity].path),
  );
  if (inEntityFolder) return true;

  return LEGACY_DELETE_ONLY_FOLDERS.some(
    (entry) =>
      roleIsInList(entry.allowedRoles, userRole) &&
      publicIdBelongsToFolder(publicId, entry.folder),
  );
}
