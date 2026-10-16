"use client";

import type { Notification } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({
  notification,
}: NotificationItemProps) {
  const { title, message, createdAt, isRead } = notification;

  return (
    <div
      className={`border-b border-white/5 px-4 py-3 transition ${
        !isRead ? "bg-primary/10" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        {!isRead && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-mint-200" />
        )}

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-white">
            {title}
          </h4>

          <p className="mt-1 text-xs leading-relaxed text-white/70">
            {message}
          </p>

          <p className="mt-2 text-[11px] text-white/70">
            {new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(createdAt))}
          </p>
        </div>
      </div>
    </div>
  );
}