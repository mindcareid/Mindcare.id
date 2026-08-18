"use client";

import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ProfileAvatar from "./ProfileAvatar";

export default function ProfileHeader({ user }: { user: any }) {
  const { update } = useSession();

  const openWidget = () => {
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dnl3cqeaa",
        uploadPreset: "Design_V2",
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1,
        folder: "profile",
        showCompletedButton: false,
        singleUploadAutoClose: true,
      },
      async (error: any, result: any) => {
        if (!error && result.event === "success") {
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
          } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Something went wrong");
          }
        }
      },
    );

    widget.open();
  };

  return (
    <div className="flex items-center gap-4">
      <ProfileAvatar image={user.photo} name={user.name} onClick={openWidget} />

      <div className="flex flex-col justify-start items-start gap-1">
        <button
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
