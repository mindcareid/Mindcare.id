const rawPreset =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ??
  process.env.CLOUDINARY_UPLOAD_PRESET;

export const CLOUDINARY_UPLOAD_PRESET = rawPreset?.trim() || "app_data";
