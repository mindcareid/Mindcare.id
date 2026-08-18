"use client";

import type { Notification } from "@/types/notification";

import NotificationItem from "./NotificationItem";
import NotificationSkeleton from "./NotificationSkeleton";
import NotificationEmpty from "./NotificationEmpty";

import { useMarkAllNotificationsRead } from "@/app/hooks/useMarkAllNotificationsRead";

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onClose?: () => void;
}

export default function NotificationDropdown({
  notifications,
  unreadCount,
  loading,
}: NotificationDropdownProps) {
  const markAllMutation = useMarkAllNotificationsRead();

  return (
    <div className="fixed left-2 right-2 top-16 z-50 w-auto overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">

        <div>
          <h3 className="text-sm font-semibold text-white">
            Notifications
          </h3>

          <p className="text-xs text-gray-400">
            {unreadCount} unread
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            disabled={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
            className="text-xs font-medium text-blue-400 transition hover:text-blue-300 disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Body */}

      <div className="max-h-105 overflow-y-auto">

        {loading && (
          <NotificationSkeleton rows={5} />
        )}

        {!loading && notifications.length === 0 && (
          <NotificationEmpty />
        )}

        {!loading &&
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
      </div>
    </div>
  );
}