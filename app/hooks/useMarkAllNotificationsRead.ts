import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "@/lib/notification-query";
import type { Notification } from "@/types/notification";

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      return res.json();
    },

    // Optimistic Update
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: notificationKeys.all,
      });

      const previous =
        queryClient.getQueryData<Notification[]>(
          notificationKeys.all
        ) ?? [];

      queryClient.setQueryData<Notification[]>(
        notificationKeys.all,
        previous.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          notificationKeys.all,
          context.previous
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
}