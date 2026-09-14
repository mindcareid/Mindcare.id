import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { participantOrderSelect } from "./queries";
import { mapOrderToParticipantRow } from "./mapper";
import type { ParticipantReportRow } from "./type";

const export_limit = 5000;

type ExportExcel = {
  eventId: number;
  status?: "PENDING" | "PAID" | "EXPIRED" | "CANCELED";
};
export async function getAllEventParticipantForExport(params: ExportExcel) {
  const { eventId, status } = params;
  const where: Prisma.OrderWhereInput = {
    eventId,
    ...(status ? { status } : {}),
  };

  const [orders, event, fields] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: export_limit,
      select: participantOrderSelect,
    }),

    prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    }),

    prisma.eventAttendeeField.findMany({
      where: { eventId },
      orderBy: { sortOrder: "asc" },
      select: { id: true, key: true, label: true },
    }),
  ]);

  const data: ParticipantReportRow[] = orders.map(mapOrderToParticipantRow);
  return { event, fields, data };
}
