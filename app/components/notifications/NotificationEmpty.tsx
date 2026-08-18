"use client";

import { FiBellOff } from "react-icons/fi";

export default function NotificationEmpty() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-white/5 p-4">
        <FiBellOff
          size={28}
          className="text-gray-500"
        />
      </div>

      <h3 className="text-sm font-semibold text-white">
        No notifications
      </h3>

      <p className="mt-1 max-w-xs text-xs leading-relaxed text-gray-400">
        You&apos;re all caught up. New notifications will appear here.
      </p>
    </div>
  );
}