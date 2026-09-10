import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { GetParticipantsQuery } from "@/lib/validations/auth";
import type { ParticipantReportRow } from "./type";
import { mapOrderToParticipantRow } from "./mapper";

export const participantOrderSelect = {
  id: true,
  amount: true,
  status: true,
  createdAt: true,

  user: {
    select: {
      name: true,
      email: true,
      phoneNumber: true,
    },
  },

  tickets: {
    select: {
      id: true,
      attendeeName: true,
      attendeeEmail: true,
      attendeePhone: true,
      attendeeData: true,
      code: true,
      isCheckedIn: true,
    },
  },
} satisfies Prisma.OrderSelect;

type GetParticipantsParams = GetParticipantsQuery & {
  eventId: number;
};

export async function getEventParticipants(params: GetParticipantsParams) {
  const { eventId, page, limit, status } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
    eventId,
    ...(status ? { status } : {}),
  };

  const [orders, total, event, fields] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: participantOrderSelect,
    }),

    prisma.order.count({ where }),

    prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, price: true, quota: true },
    }),
    prisma.eventAttendeeField.findMany({
      where: { eventId },
      orderBy: { sortOrder: "asc" },
      select: { id: true, key: true, label: true },
    }),
  ]);

  const data: ParticipantReportRow[] = orders.map(mapOrderToParticipantRow);

  return {
    event,
    fields,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
