"use client";

import { useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCroppedImage } from "@/lib/cropImage";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import type { UploadFolderImage } from "@/lib/cloudinary/types/upload";
import Image from "next/image";

export type ImageValue = {
  url: string | null;
  publicId: string | null;
};

type ImageUploadFieldProps = {
  label: string;
  hint?: string;
  entityType: UploadFolderImage;
  value: ImageValue;
  onChange: (next: ImageValue) => void;
  aspect?: number;
  maxWidth?: number;
  maxHeight?: number;
  shape?: "wide" | "square";
  disabled?: boolean;
  required?: boolean;
  error?: string;
};

const MAX_FILE_MB = 10;

export default function ImageUploadField({
  label,
  hint,
  entityType,
  value,
  onChange,
  aspect = 1,
  maxWidth,
  maxHeight,
  shape = "wide",
  disabled = false,
  required = false,
  error,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const resolvedMaxWidth = maxWidth ?? (aspect > 1 ? 1600 : 512);
  const resolvedMaxHeight = maxHeight ?? (aspect > 1 ? 900 : 512);

  function openPicker() {
    if (disabled || busy) return;
    setMessage(null);
    inputRef.current?.click();
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Only image files are supported.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setMessage(
        `Image is larger than ${MAX_FILE_MB} MB. Pick a smaller file.`,
      );
      return;
    }

    setMessage(null);
    const dataUrl = await readAsDataUrl(file);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setImageSrc(dataUrl);
  }

  async function handleApplyCrop() {
    if (!imageSrc || !croppedArea) return;
    setBusy(true);
    setMessage(null);
    try {
      const blob = await getCroppedImage(imageSrc, croppedArea, {
        maxWidth: resolvedMaxWidth,
        maxHeight: resolvedMaxHeight,
      });
      const uploaded = await uploadToCloudinary(
        blob,
        entityType,
        value.publicId,
      );
      onChange({ url: uploaded.secure_url, publicId: uploaded.public_id });
      setImageSrc(null);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    setMessage(null);
    try {
      // Menghapus aset bersifat best-effort: kalau gagal (mis. sudah tidak
      // ada), tampilan tetap dibersihkan supaya pengguna tidak terjebak.
      if (value.publicId) {
        await fetch("/api/cloudinary/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: value.publicId }),
        }).catch(() => undefined);
      }
    } finally {
      onChange({ url: null, publicId: null });
      setBusy(false);
    }
  }

  const previewClass =
    shape === "square"
      ? "h-32 w-32 rounded-xl"
      : "aspect-video w-full max-w-sm rounded-xl";

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {value.url ? (
        <div className="flex flex-wrap items-start gap-4">
          <div
            className={cn(
              "relative overflow-hidden border border-border bg-muted",
              previewClass,
            )}
          >
            <Image
              src={value.url}
              alt={label}
              fill
              sizes="(min-width: 640px) 384px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled || busy}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || busy}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || busy}
          className={cn(
            "flex w-full max-w-sm flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-8 text-center transition-colors hover:bg-muted disabled:opacity-50",
            shape === "square" ? "h-32 w-32" : "aspect-video",
          )}
        >
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            Click to choose an image
          </span>
        </button>
      )}

      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {message ? <p className="text-xs text-destructive">{message}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {imageSrc ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-foreground/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Crop ${label}`}
        >
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <p className="text-sm font-medium text-foreground">
                Crop {label.toLowerCase()}
              </p>
              <button
                type="button"
                onClick={() => setImageSrc(null)}
                disabled={busy}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <div className="relative h-[55vh] w-full bg-black/80">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedArea(pixels)}
              />
            </div>

            <div className="space-y-4 border-t border-border px-5 py-4">
              <label className="flex items-center gap-3 text-sm text-foreground">
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Resized to {resolvedMaxWidth}x{resolvedMaxHeight} max and
                  saved as WebP (JPEG fallback) — normally under 100 KB.
                </p>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  disabled={busy || !croppedArea}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50",
                  )}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {busy ? "Uploading..." : "Save image"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}
