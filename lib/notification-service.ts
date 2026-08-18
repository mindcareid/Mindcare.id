import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  NotificationStatus,
  NotificationType,
} from "@/types/notification";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

export interface CreateNotificationInput {
  userId: number;

  type: NotificationType;

  title: string;

  message: string;

  data?: Prisma.InputJsonValue;

  status?: NotificationStatus;
}

/**
 * =========================================================
 * CREATE NOTIFICATION
 * =========================================================
 *
 */
export async function createNotification(
  input: CreateNotificationInput,
) {
  const {
    userId,
    type,
    title,
    message,
    data,
    status = "PENDING",
  } = input;

  if (!userId) {
    throw new Error(
      "Notification userId is required.",
    );
  }

  if (!title.trim()) {
    throw new Error(
      "Notification title is required.",
    );
  }

  if (!message.trim()) {
    throw new Error(
      "Notification message is required.",
    );
  }

  /**
   * ============================================
   * 1. SAVE TO DATABASE
   * ============================================
   */

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title: title.trim(),
      message: message.trim(),
      data,
      status,
    },
  });

  //console.log( "🔔 Notification created:", notification.id, ); console.log( "👤 Target user:", userId, );

  /**
   * ============================================
   * 2. SEND REALTIME NOTIFICATION
   * ============================================
   */

  try {
    const socketServerUrl =
      process.env.SOCKET_SERVER_URL;
      
      console.log( "🔌 SOCKET_SERVER_URL:", socketServerUrl, );

      
    if (!socketServerUrl) {
      console.warn(
        "[Notification] SOCKET_SERVER_URL is not configured",
      );
    } else {
      const url =
        `${socketServerUrl}/internal/notifications/send`;

      console.log(
        "[Notification] Calling socket server:",
        url,
      );

      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          ...(process.env.SOCKET_INTERNAL_SECRET
            ? {
              "x-internal-secret":
                process.env.SOCKET_INTERNAL_SECRET,
            }
            : {}),
        },

        body: JSON.stringify({
          userId,
          notification,
        }),
      });

      const result = await response.text();

      console.log(
        "[Notification] Socket response:",
        response.status,
        result,
      );
    }
  } catch (error) {
    console.error(
      "[Notification] Socket request failed:",
      error,
    );
  }

  return notification;
}

/**
 * =========================================================
 * GET USER NOTIFICATIONS
 * =========================================================
 */
export async function getUserNotifications(
  userId: number,
) {
  return prisma.notification.findMany({
    where: {
      userId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * =========================================================
 * GET UNREAD COUNT
 * =========================================================
 */
export async function getUnreadNotificationCount(
  userId: number,
) {
  return prisma.notification.count({
    where: {
      userId,

      isRead: false,
    },
  });
}

/**
 * =========================================================
 * MARK ONE NOTIFICATION AS READ
 * =========================================================
 */
export async function markNotificationAsRead(
  notificationId: number,
  userId: number,
) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,

      userId,

      isRead: false,
    },

    data: {
      isRead: true,
    },
  });
}

/**
 * =========================================================
 * MARK ALL NOTIFICATIONS AS READ
 * =========================================================
 */
export async function markAllNotificationsAsRead(
  userId: number,
) {
  return prisma.notification.updateMany({
    where: {
      userId,

      isRead: false,
    },

    data: {
      isRead: true,
    },
  });
}

/**
 * =========================================================
 * UPDATE NOTIFICATION STATUS
 * =========================================================
 */
export async function updateNotificationStatus(
  notificationId: number,
  userId: number,
  status: NotificationStatus,
) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,

      userId,
    },

    data: {
      status,
    },
  });
}

/**
 * =========================================================
 * DELETE NOTIFICATION
 * =========================================================
 */
export async function deleteNotification(
  notificationId: number,
  userId: number,
) {
  return prisma.notification.deleteMany({
    where: {
      id: notificationId,

      userId,
    },
  });
}

