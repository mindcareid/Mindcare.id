export const NotificationStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DECLINED: "DECLINED",
} as const;

export type NotificationStatus =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const NotificationType = {
  COMPANY_INVITE: "COMPANY_INVITE",
  COMPANY_ACCEPTED: "COMPANY_ACCEPTED",
  COMPANY_DECLINED: "COMPANY_DECLINED",
  GENERAL: "GENERAL",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export interface Notification<T = unknown> {
  id: number;
  userId: number;

  type: NotificationType;

  title: string;
  message: string;

  data: T | null;

  isRead: boolean;

  status: NotificationStatus | null;

  createdAt: string;
}