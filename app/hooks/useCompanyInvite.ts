import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "@/lib/notification-query";
import type { Notification } from "@/types/notification";

type InviteAction = "ACCEPT" | "DECLINE";

interface InviteVariables {
  companyUserId: number;
  notificationId: number;
  action: InviteAction;
}

export function useCompanyInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyUserId,
      notificationId,
      action,
    }: InviteVariables) => {
      console.log("🚀 Company invite:", {
        companyUserId,
        notificationId,
        action,
      });

      const res = await fetch(
        `/api/company/invite/${companyUserId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            notificationId,
          }),
        },
      );

      const result = await res.json();

      console.log("📥 Company invite response:", result);

      if (!res.ok) {
        throw new Error(
          result?.message ??
            "Failed to process invitation",
        );
      }

      return result;
    },

    onMutate: async ({
      notificationId,
      action,
    }) => {
      await queryClient.cancelQueries({
        queryKey: notificationKeys.all,
      });

      const previous =
        queryClient.getQueryData<Notification[]>(
          notificationKeys.all,
        ) ?? [];

      queryClient.setQueryData<Notification[]>(
        notificationKeys.all,
        previous.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                status:
                  action === "ACCEPT"
                    ? "ACTIVE"
                    : "DECLINED",
                isRead: true,
              }
            : item,
        ),
      );

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          notificationKeys.all,
          context.previous,
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