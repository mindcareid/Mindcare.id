"use client";
import Image from "next/image";
import Link from "next/link";
import { BsCalendar2Date } from "react-icons/bs";
import { FiExternalLink } from "react-icons/fi";

export default function ProfileUserSchedule({ user }: { user: any }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-300 flex flex-col gap-6">
      <div className="flex flex-row justify-between items-center gap-2">
        <div className="flex flex-col items-start gap-1">
          <div className="flex flex-row items-center gap-1">
            <BsCalendar2Date className="w-5 h-5 text-gray-600" />
            <p className="text-xl font-semibold text-gray-500">Schedule</p>
          </div>
          <p className="text-base font-semibold text-gray-500">
            Scheduled training session
          </p>
        </div>
        <Link
          href="/dashboard/schedules"
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
          There are no classes at the moment.
        </p>
      </div>
    </div>
  );
}
