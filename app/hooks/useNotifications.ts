import { useQuery } from "@tanstack/react-query";
import { notificationKeys } from "@/lib/notification-query";
import type { Notification } from "@/types/notification";
import type { ApiResponse } from "@/types/api";

async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch("/api/notifications", {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notifications");
  }

  const json: ApiResponse<Notification[]> = await res.json();

  return json.data ?? [];
}

export function useNotifications() {
  const query = useQuery({
    queryKey: notificationKeys.all,
    queryFn: fetchNotifications,

    staleTime: 1000 * 60, // 1 menit

    gcTime: 1000 * 60 * 10, // 10 menit

    refetchOnWindowFocus: false,

    refetchOnReconnect: true,

    retry: 2,

    placeholderData: (previousData) => previousData,

    select: (notifications) => {
      const unreadCount = notifications.filter(
        (item) => !item.isRead
      ).length;

      return {
        notifications,

        unreadCount,
      };
    },
  });

  return {
    notifications: query.data?.notifications ?? [],

    unreadCount: query.data?.unreadCount ?? 0,

    isLoading: query.isLoading,

    isFetching: query.isFetching,

    isError: query.isError,

    error: query.error,

    refetch: query.refetch,
  };
}