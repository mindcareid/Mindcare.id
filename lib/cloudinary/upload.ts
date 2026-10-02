import type {
  ServerUploadResponse,
  UploadFolderImage,
} from "./types/upload";

/**
 * Upload file lewat endpoint server-side (/api/cloudinary/upload).
 * Folder + resource_type dikontrol server dari `entityType` (lihat
 * lib/cloudinary/folders.ts), dan aset lama (oldPublicId) dibersihkan
 * server secara best-effort. Ini menggantikan direct POST unsigned ke
 * api.cloudinary.com yang foldernya bisa ditimpa dari browser.
 */
export async function uploadToCloudinary(
  file: Blob | File,
  entityType: UploadFolderImage,
  oldPublicId?: string | null,
): Promise<ServerUploadResponse> {
  const formData = new FormData();
  formData.append("file", file, file instanceof File ? file.name : "upload");
  formData.append("entityType", entityType);
  if (oldPublicId) formData.append("oldPublicId", oldPublicId);

  const res = await fetch("/api/cloudinary/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const problem = await res.json().catch(() => null);
    throw new Error(
      problem?.message ?? `Upload failed (status ${res.status}). Try again.`,
    );
  }

  const json = (await res.json()) as { data?: ServerUploadResponse };
  if (!json.data?.secure_url || !json.data?.public_id) {
    throw new Error("Upload response missing secure_url/public_id.");
  }
  return json.data;
}
