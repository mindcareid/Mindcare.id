"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/providers/SocketProvider";
import type { Notification } from "@/types/notification";

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    /**
     * Notification baru
     */
    const onCreate = (notification: Notification) => {
      queryClient.setQueryData<Notification[]>(
        ["notifications"],
        (old = []) => {
          // Hindari duplicate jika event terkirim dua kali
          if (old.some((item) => item.id === notification.id)) {
            return old;
          }

          return [notification, ...old];
        }
      );

      toast.success(notification.title, {
        description: notification.message,
      });
    };

    /**
     * Notification diupdate
     */
    const onUpdate = (notification: Notification) => {
      queryClient.setQueryData<Notification[]>(
        ["notifications"],
        (old = []) =>
          old.map((item) =>
            item.id === notification.id ? notification : item
          )
      );
    };

    /**
     * Notification dihapus
     */
    const onDelete = (id: number) => {
      queryClient.setQueryData<Notification[]>(
        ["notifications"],
        (old = []) => old.filter((item) => item.id !== id)
      );
    };

    /**
     * Semua notification dibaca
     */
    const onReadAll = () => {
      queryClient.setQueryData<Notification[]>(
        ["notifications"],
        (old = []) =>
          old.map((item) => ({
            ...item,
            isRead: true,
          }))
      );
    };

    socket.on("notification:new", onCreate);
    socket.on("notification:update", onUpdate);
    socket.on("notification:delete", onDelete);
    socket.on("notification:read-all", onReadAll);

    return () => {
      socket.off("notification:new", onCreate);
      socket.off("notification:update", onUpdate);
      socket.off("notification:delete", onDelete);
      socket.off("notification:read-all", onReadAll);
    };
  }, [socket, queryClient]);

  return children;
}