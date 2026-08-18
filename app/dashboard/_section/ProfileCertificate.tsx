"use client";

import Image from "next/image";
import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import { GrCertificate } from "react-icons/gr";

export default function ProfileUserCertificate({ user }: { user: any }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-300 flex flex-col gap-6">
      <div className="flex flex-row justify-between items-center gap-2">
        <div className="flex flex-col items-start gap-1">
          <div className="flex flex-row items-center gap-1">
            <GrCertificate className="w-5 h-5 text-gray-600" />
            <p className="text-xl font-semibold text-gray-500">Certificate</p>
          </div>
          <p className="text-base font-semibold text-gray-500">0 Certificate</p>
        </div>
        <Link
          href="/dashboard/my-certificate"
          className="flex flex-row items-center gap-1"
        >
          <FiExternalLink className="w-5 h-5 text-gray-600 hover:text-blue-500" />
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center text-center gap-4 py-6">
        <Image
          src="/images/logo/empty.webp"
          alt="Empty"
          width={200}
          height={100}
        />
        <p className="text-base text-gray-500">
          There are no certificate at the moment.
        </p>
      </div>
    </div>
  );
}
