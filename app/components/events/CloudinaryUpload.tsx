"use client";

import Image from "next/image";
import { useRef } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { ensureCloudinaryWidget } from "@/lib/cloudinary/widget";
import type { UploadSignatureResponse } from "@/lib/cloudinary/types/upload";
import type { UploadFolderImage } from "@/lib/cloudinary/types/upload";

type Props = {
  value: string | null;
  publicId: string | null;
  onChange: (url: string, publicId: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  oldPublicId?: string | null;
  /** Entity target; folder ditentukan server lewat signed upload. */
  entityType: UploadFolderImage;
  label?: string;
  aspectRatio?: "cover" | "square" | "logo";
};

const ASPECT: Record<string, string> = {
  cover: "h-48",
  square: "h-40 w-40",
  logo: "h-24 w-24",
};

export default function CloudinaryUpload({
  value,
  publicId,
  onChange,
  onRemove,
  disabled = false,
  oldPublicId,
  entityType,
  label = "Upload image",
  aspectRatio = "cover",
}: Props) {
  const pendingOldPublicId = useRef<string | null>(null);

  //api untuk destroy gambar
  const destroyOldImage = async (pubId: string) => {
    await fetch("/api/cloudinary/destroy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId: pubId }),
    });
  };

  const openWidget = async () => {
    if (disabled) return;

    try {
      const res = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType }),
      });

      if (!res.ok) {
        const problem = await res.json().catch(() => null);
        toast.error("Failed to prepare upload", {
          description:
            problem?.message ??
            `The server replied with status ${res.status}. Try again or sign in again.`,
        });
        return;
      }

      const { data }: { data: UploadSignatureResponse } = await res.json();
      const cloudinary = await ensureCloudinaryWidget();

      pendingOldPublicId.current = oldPublicId ?? null;
      const widget = cloudinary.createUploadWidget(
        {
          cloudName: data.cloudName,
          apiKey: data.apiKey,
          uploadSignature: data.signature,
          uploadSignatureTimestamp: data.timestamp,
          folder: data.folder,
          multiple: false,
          cropping: true,
          croppingCoordinatesMode: "custom",
          showSkipCropButton: true,
          showCompletedButton: false,
          singleUploadAutoClose: true,
        },
        async (error, result) => {
          if (error) {
            if (error.status !== "abort" && error.status !== "cancel") {
              toast.error("Upload failed", {
                description: error.message ?? "Please try again.",
              });
            }
            return;
          }
          if (result.event === "success") {
            if (pendingOldPublicId.current) {
              await destroyOldImage(pendingOldPublicId.current);
            }
            onChange(result.info.secure_url, result.info.public_id);
            toast.success("Successfully uploaded image!");
          }
        },
      );
      widget.open();
    } catch (err) {
      console.error("[CLOUDINARY_WIDGET_UPLOAD]", err);
      toast.error("Upload could not be opened", {
        description:
          err instanceof Error ? err.message : "Please try again later.",
      });
    }
  };

  const heightClass = ASPECT[aspectRatio] ?? "h-48";

  return (
    <div className="space-y-2">
      {value ? (
        <div
          className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-gray-200 group`}
        >
          <Image
            src={value}
            alt={label}
            fill
            className="object-cover"
            unoptimized
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={openWidget}
                className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-100 transition-colors flex items-center gap-1.5"
              >
                <FiUpload size={13} />
                Change
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (publicId) await destroyOldImage(publicId);
                  onRemove();
                }}
                className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors flex items-center gap-1.5"
              >
                <FiX size={13} />
                Delete
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={openWidget}
          disabled={disabled}
          className={`w-full ${heightClass} rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors ${
            disabled
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer"
          }`}
        >
          <div
            className={`rounded-full p-3 ${disabled ? "bg-gray-100" : "bg-blue-50"}`}
          >
            <FiUpload
              size={20}
              className={disabled ? "text-gray-300" : "text-blue-500"}
            />
          </div>
          <div className="text-center">
            <p
              className={`text-sm font-medium ${disabled ? "text-gray-300" : "text-gray-600"}`}
            >
              {label}
            </p>
            <p
              className={`text-xs mt-0.5 ${disabled ? "text-gray-300" : "text-gray-400"}`}
            ></p>
          </div>
        </button>
      )}
    </div>
  );
}
