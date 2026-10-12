"use client";

import Image from "next/image";

export default function ProfileAvatar({
  image,
  name,
  onClick,
}: {
  image?: string | null;
  name?: string | null;
  onClick?: () => void;
}) {
  const initial = name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center w-24 h-24 lg:w-28 lg:h-28 rounded-full border-2 border-dashed border-border cursor-pointer hover:border-primary transition overflow-hidden"
    >
      {image ? (
        <Image
          src={image}
          alt="Profile"
          unoptimized
          fill
          sizes="(min-width: 1024px) 112px, 96px"
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-semibold text-3xl lg:text-4xl select-none">
          {initial}
        </div>
      )}
    </div>
  );
}
