import prisma from "@/lib/prisma";

import { buildEventWhere } from "./filters";
import { EVENTS_PAGE_LIMIT } from "./constants";
import { eventCardSelect, eventListSelect } from "./event.select";
import { serializeEventDetail } from "./serializers";
import { GetEventsParams } from "./types";


export async function getEvents(params: GetEventsParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? EVENTS_PAGE_LIMIT;
  const skip = (page - 1) * limit;

  const where = buildEventWhere(params);

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        startDate: "asc",
      },

      select: eventCardSelect,
    }),

    prisma.event.count({
      where,
    }),
  ]);

  return {
    data: events,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getEventBySlug(slug: string) {
  const event = await prisma.event.findFirst({
    where: {
      slug,
      deletedAt: null,
      isPublished: true,
      company: {
        deletedAt: null,
        isActive: true,
      },
    },

    select: {
      ...eventListSelect,
      companyId: true,
    },
  });

  if (!event) {
    return null;
  }

  const [totalCompanyEvents, soldCount] = await Promise.all([
    prisma.event.count({
      where: {
        companyId: event.companyId,
        deletedAt: null,
        isPublished: true,
      },
    }),

    event.quota !== null
      ? prisma.ticket.count({
          where: {
            order: {
              eventId: event.id,
              status: {
                in: ["PAID", "PENDING"],
              },
            },
          },
        })
      : Promise.resolve(0),
  ]);

  const remaining =
    event.quota !== null
      ? Math.max(event.quota - soldCount, 0)
      : null;

  const soldOut =
    event.quota !== null &&
    remaining !== null &&
    remaining <= 0;

  return serializeEventDetail(
    event,
    soldCount,
    totalCompanyEvents,
    remaining,
    soldOut,
  );
}

export async function getEventCategories() {
  return prisma.eventCategory.findMany({
    where: {
      isActive: true,
    },

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function getIndustries() {
  return prisma.industry.findMany({
    where: {
      isActive: true,
    },

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}