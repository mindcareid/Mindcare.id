import { Prisma } from "@prisma/client";
import { participantOrderSelect } from "./queries";

export type ParticipantOrder = Prisma.OrderGetPayload<{
  select: typeof participantOrderSelect;
}>;

export type ParticipantReportRow = {
  orderId: string;
  buyer: {
    name: string;
    email: string;
    phone: string | null;
  };
  transactionDate: Date;
  isFree: boolean;
  quantity: number;
  totalPayment: number;
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELED" | "REFUNDED";
  attendees: {
    ticketId: string;
    name: string;
    email: string;
    phone: string | null;
    code: string;
    isCheckedIn: boolean;
    answers: Record<string, unknown>;
  }[];
};

export type ParticipantReportMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
