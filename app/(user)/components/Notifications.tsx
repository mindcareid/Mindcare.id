"use client";

import { useEffect, useRef, useState } from "react";
import { FiBell, FiCheck, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { useSocket } from "@/providers/SocketProvider";


type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  status?: string | null;
  isRead: boolean;
  data?: string;
  createdAt: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unRead, setUnRead] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  const fetchUnreadNotif = async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      const data = await res.json();
      setUnRead(data.count ?? 0);
    } catch {
      console.error("Faile to Fetch Data");
    }
  };
  // ── Fetch notifikasi ──
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.data ?? []);
      setUnRead(data.data?.filter((n: Notification) => !n.isRead).length ?? 0);
    } catch {
      console.error("Gagal fetch notifikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchUnreadNotif();

    const onNewNotification = () => {

        fetchUnreadNotif();

        if (open) {
            fetchNotifications();
        }

    };

    socket.on("notification:new", onNewNotification);

    return () => {
        socket.off("notification:new", onNewNotification);
    };

}, [socket, open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Accept / Decline invite ──
  const handleInviteAction = async (
    notif: Notification,
    action: "ACCEPT" | "DECLINE",
  ) => {
    const data = notif.data ? JSON.parse(notif.data) : null;
    if (!data?.companyUserId) return;

    setActionLoading(notif.id);
    try {
      const res = await fetch(`/api/company/invite/${data.companyUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();

      toast.success(
        action === "ACCEPT" ? "Successfully joined!" : "Invitation declined",
      );
      fetchNotifications();
    } catch {
      toast.error("Failed to process the invitation");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Mark all as read ──
  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    fetchNotifications();
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-neutral-700 hover:bg-white/10 hover:text-neutral-950 transition"
      >
        <FiBell size={20} />
        {unRead > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unRead > 9 ? "9+" : unRead}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-80 bg-slate-900/98  border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white">Notification</h3>
            {unRead > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-400 hover:text-blue-300 transition"
              >
                Mark All read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse space-y-1.5">
                    <div className="h-3 w-40 bg-white/10 rounded" />
                    <div className="h-3 w-56 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                There are no notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-white/5 transition ${
                    !notif.isRead ? "bg-blue-600/10" : ""
                  }`}
                >
                  {/* Dot + Title */}
                  <div className="flex items-start gap-2">
                    {!notif.isRead && (
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Tombol Accept/Decline khusus COMPANY_INVITE */}
                      {/* Tombol Accept/Decline */}
                      {notif.type === "COMPANY_INVITE" &&
                        notif.status === "PENDING" && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() =>
                                handleInviteAction(notif, "ACCEPT")
                              }
                              disabled={actionLoading === notif.id}
                              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                            >
                              <FiCheck size={12} />
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleInviteAction(notif, "DECLINE")
                              }
                              disabled={actionLoading === notif.id}
                              className="flex items-center gap-1 border border-white/20 text-gray-300 hover:bg-white/10 text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                            >
                              <FiX size={12} />
                              Declined
                            </button>
                          </div>
                        )}
                      {notif.type === "COMPANY_INVITE" &&
                        notif.status === "ACTIVE" && (
                          <span className="mt-2 inline-block text-xs text-green-400">
                            ✓ Invitation Accepted
                          </span>
                        )}
                      {notif.type === "COMPANY_INVITE" &&
                        notif.status === "DECLINED" && (
                          <span className="mt-2 inline-block text-xs text-red-400">
                            ✗ Invitation Declined
                          </span>
                        )}

                      <p className="text-[11px] text-white mt-1.5">
                        {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
