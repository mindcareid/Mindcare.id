"use client";

import NotificationActions from "./NotificationActions";

import type { Notification } from "@/types/notification";
import { NotificationStatus, NotificationType } from "@prisma/client";

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({
  notification,
}: NotificationItemProps) {
  const {
    title,
    message,
    createdAt,
    isRead,
    type,
    status,
  } = notification;

  return (
    <div
      className={`border-b border-white/5 px-4 py-3 transition ${
        !isRead ? "bg-blue-600/10" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        {!isRead && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
        )}

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-white">
            {title}
          </h4>

          <p className="mt-1 text-xs leading-relaxed text-gray-400">
            {message}
          </p>

          {type === NotificationType.COMPANY_INVITE && 
            status === NotificationStatus.PENDING && (
            <NotificationActions
              notification={notification}
            />
          )}

          {type === NotificationType.COMPANY_INVITE &&
            status === NotificationStatus.ACTIVE && (
              <span className="mt-2 inline-block text-xs font-medium text-green-400">
                ✓ Invitation Accepted
              </span>
            )}

          {type === NotificationType.COMPANY_INVITE &&
            status === NotificationStatus.DECLINED && (
              <span className="mt-2 inline-block text-xs font-medium text-red-400">
                ✕ Invitation Declined
              </span>
            )}

          <p className="mt-2 text-[11px] text-gray-500">
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