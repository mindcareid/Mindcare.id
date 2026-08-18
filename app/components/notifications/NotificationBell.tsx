"use client";

import { useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import { useClickAway } from "react-use";

import { useNotifications } from "@/app/hooks/useNotifications";

import NotificationBadge from "./NotificationBadge";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
  } = useNotifications();

  useClickAway(ref, () => {
    setOpen(false);
  });

  return (
    <div
      ref={ref}
      className="relative"
    >
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-lg p-2 text-neutral-700 transition hover:bg-white/10 hover:text-neutral-950"
      >
        <FiBell size={20} />

        <NotificationBadge count={unreadCount} />
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          loading={isLoading}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}