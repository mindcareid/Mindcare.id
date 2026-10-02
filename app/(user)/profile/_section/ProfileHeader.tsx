"use client";

import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { toast } from "sonner";
import { ensureCloudinaryWidget } from "@/lib/cloudinary/widget";
import type { UploadSignatureResponse } from "@/lib/cloudinary/types/upload";
import type {
  CloudinaryUploadError,
  CloudinaryUploadResult,
} from "@/lib/cloudinary/types/cloudinary";
import ProfileAvatar from "./ProfileAvatar";

export default function ProfileHeader({
  user,
}: {
  user?: Pick<Session["user"], "photo" | "name"> | null;
}) {
  const { update } = useSession();

  const openWidget = async () => {
    try {
      const res = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: "users" }),
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

      const widget = cloudinary.createUploadWidget(
        {
          cloudName: data.cloudName,
          apiKey: data.apiKey,
          uploadSignature: data.signature,
          uploadSignatureTimestamp: data.timestamp,
          folder: data.folder,
          multiple: false,
          cropping: true,
          croppingAspectRatio: 1,
          showCompletedButton: false,
          singleUploadAutoClose: true,
        },
        async (
          error: CloudinaryUploadError | null,
          result: CloudinaryUploadResult,
        ) => {
          if (error) {
            if (error.status !== "abort" && error.status !== "cancel") {
              toast.error("Upload failed", {
                description: error.message ?? "Please try again.",
              });
            }
            return;
          }
          if (result.event === "success") {
            const loadingToast = toast.loading("Uploading image...");

            try {
              const photoUrl = result.info.secure_url;
              const publicId = result.info.public_id;

              const res = await fetch("/api/user/upload-avatar", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ photo: photoUrl, publicId }),
              });

              if (!res.ok) {
                toast.dismiss(loadingToast);
                toast.error("Failed to update avatar");
                return;
              }
              await update({ photo: photoUrl });
              toast.dismiss(loadingToast);
              toast.success("Profile picture updated!");
            } catch {
              toast.dismiss(loadingToast);
              toast.error("Something went wrong");
            }
          }
        },
      );

      widget.open();
    } catch (err) {
      console.error("[PROFILE_AVATAR_UPLOAD]", err);
      toast.error("Upload could not be opened", {
        description:
          err instanceof Error ? err.message : "Please try again later.",
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <ProfileAvatar
        image={user?.photo}
        name={user?.name}
        onClick={openWidget}
      />

      <div className="flex flex-col justify-start items-start gap-1">
        <button
          type="button"
          onClick={openWidget}
          className="text-blue-600 font-semibold hover:underline"
        >
          Upload photo
        </button>

        <p className="text-xs text-gray-500">
          • Upload with <span className="font-medium">1:1 (square)</span> ratio.
        </p>
      </div>
    </div>
  );
}
