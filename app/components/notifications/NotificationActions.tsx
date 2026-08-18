"use client";

import { FiCheck, FiX } from "react-icons/fi";

import {
  NotificationStatus,
  NotificationType,
} from "@prisma/client";

import type { Notification } from "@/types/notification";

import { useCompanyInvite } from "@/app/hooks/useCompanyInvite";

interface CompanyInviteData {
  companyUserId: number;
  companyId?: number;
  companyName?: string;
}

interface Props {
  notification: Notification;
}

export default function NotificationActions({
  notification,
}: Props) {
  const inviteMutation = useCompanyInvite();

  /**
   * Hanya COMPANY_INVITE
   */
  if (
    notification.type !==
    NotificationType.COMPANY_INVITE
  ) {
    return null;
  }

  /**
   * Hanya invitation yang masih pending
   */
  if (
    notification.status !==
    NotificationStatus.PENDING
  ) {
    return null;
  }

  /**
   * Notification.data bisa:
   *
   * 1. object
   * 2. JSON string
   */
  let data: CompanyInviteData | null = null;

  if (notification.data) {
    if (typeof notification.data === "string") {
      try {
        data = JSON.parse(
          notification.data,
        ) as CompanyInviteData;
      } catch (error) {
        console.error(
          "❌ Failed to parse notification data:",
          error,
        );
      }
    } else {
      data =
        notification.data as CompanyInviteData;
    }
  }

  console.log(
    "🔔 NotificationActions:",
    {
      id: notification.id,
      type: notification.type,
      status: notification.status,
      data,
    },
  );

  if (!data?.companyUserId) {
    console.warn(
      "⚠️ companyUserId tidak ditemukan",
      notification,
    );

    return null;
  }

  const handleAction = (
    action: "ACCEPT" | "DECLINE",
  ) => {
    inviteMutation.mutate({
      companyUserId:
        data!.companyUserId,

      notificationId:
        notification.id,

      action,
    });
  };

  return (
    <div className="mt-3 flex gap-2">
      <button
        type="button"
        disabled={inviteMutation.isPending}
        onClick={() =>
          handleAction("ACCEPT")
        }
        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiCheck size={12} />
        Accept
      </button>

      <button
        type="button"
        disabled={inviteMutation.isPending}
        onClick={() =>
          handleAction("DECLINE")
        }
        className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiX size={12} />
        Decline
      </button>
    </div>
  );
}