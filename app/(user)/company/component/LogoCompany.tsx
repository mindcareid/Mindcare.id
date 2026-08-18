"use client";

import Image from "next/image";
import { FiImage } from "react-icons/fi";

export default function LogoCompany({
  logo,
  onClick,
}: {
  logo?: string | null;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center w-12 h-12 lg:w-24 lg:h-24 rounded-full border-2  border-gray-300 cursor-pointer hover:border-blue-500 transition overflow-hidden"
    >
      {logo ? (
        <Image
          src={logo}
          alt="logoCompany"
          unoptimized
          fill
          sizes="(min-width: 1024px) 112px, 96px"
          className="object-contain "
        />
      ) : (
        <FiImage className="text-gray-400 w-7 h-7" />
      )}
    </div>
  );
}
