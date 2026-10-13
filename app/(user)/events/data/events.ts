import { EventStatus, OrderStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const eventListInclude = {
  category: true,

  professional: true,

  careCentre: true,

  agenda: {
    orderBy: {
      sortOrder: "asc",
    },
  },

  focusAreas: {
    include: {
      focusArea: true,
    },
  },
} satisfies Prisma.EventInclude;

const eventDetailInclude = {
  category: true,

  professional: true,

  careCentre: true,

  agenda: {
    orderBy: {
      sortOrder: "asc",
    },
  },

  industries: true,

  attendeeFields: true,

  focusAreas: {
    include: {
      focusArea: true,
    },
  },
} satisfies Prisma.EventInclude;

type EventListPayload = Prisma.EventGetPayload<{
  include: typeof eventListInclude;
}>;

type EventDetailPayload = Prisma.EventGetPayload<{
  include: typeof eventDetailInclude;
}>;

const REGISTERED_ORDER_STATUSES = [OrderStatus.PAID, OrderStatus.PENDING];

async function getRegisteredCounts(
  eventIds: number[],
): Promise<Map<number, number>> {
  const counts = new Map<number, number>();

  if (eventIds.length === 0) {
    return counts;
  }

  const orders = await prisma.order.findMany({
    where: {
      eventId: { in: eventIds },
      status: { in: REGISTERED_ORDER_STATUSES },
    },
    select: {
      eventId: true,
      _count: { select: { tickets: true } },
    },
  });

  for (const order of orders) {
    counts.set(
      order.eventId,
      (counts.get(order.eventId) ?? 0) + order._count.tickets,
    );
  }

  return counts;
}

async function getRegisteredCount(eventId: number): Promise<number> {
  return prisma.ticket.count({
    where: {
      order: {
        eventId,
        status: { in: REGISTERED_ORDER_STATUSES },
      },
    },
  });
}

export type EventHost = {
  name: string;
  type: "PLATFORM" | "PROFESSIONAL" | "CARE_CENTRE" | "SOLUTION";
  slug?: string;
};

export type EventFocusArea = {
  id: number;
  slug: string;
  name: string;
};

export type EventListItem = Omit<EventListPayload, "focusAreas"> & {
  host: EventHost;
  focusAreas: EventFocusArea[];

  registeredCount: number;
  remaining: number | null;
  soldOut: boolean;
};

export type EventDetail = Omit<EventDetailPayload, "focusAreas"> & {
  host: EventHost;
  focusAreas: EventFocusArea[];

  registeredCount: number;
  remaining: number | null;
  soldOut: boolean;
};

const publicEventWhere = {
  deletedAt: null,
  status: EventStatus.PUBLISHED,
} satisfies Prisma.EventWhereInput;

function resolveEventHost(
  event: Pick<EventListPayload, "professional" | "careCentre">,
): EventHost {
  if (event.professional) {
    return {
      name: event.professional.fullName,
      slug: event.professional.slug,
      type: "PROFESSIONAL",
    };
  }

  if (event.careCentre) {
    return {
      name: event.careCentre.name,
      slug: event.careCentre.slug,
      type: "CARE_CENTRE",
    };
  }

  return {
    name: "MindCare",
    slug: "mindcare",
    type: "PLATFORM",
  };
}

function resolveFocusAreas(
  event: Pick<EventListPayload, "focusAreas">,
): EventFocusArea[] {
  return event.focusAreas.map(({ focusArea }) => ({
    id: focusArea.id,
    slug: focusArea.slug,
    name: focusArea.name,
  }));
}

function serializeEvent(
  event: EventListPayload,
  registeredCount: number,
): EventListItem {
  const remaining =
    event.quota === null ? null : Math.max(event.quota - registeredCount, 0);

  return {
    ...event,
    host: resolveEventHost(event),
    focusAreas: resolveFocusAreas(event),
    registeredCount,
    remaining,
    soldOut: event.quota !== null && remaining === 0,
  };
}

function serializeEventDetail(
  event: EventDetailPayload,
  registeredCount: number,
): EventDetail {
  const remaining =
    event.quota === null ? null : Math.max(event.quota - registeredCount, 0);

  const soldOut = event.quota !== null && remaining === 0;

  return {
    ...event,
    host: resolveEventHost(event),
    focusAreas: resolveFocusAreas(event),
    registeredCount,
    remaining,
    soldOut,
  };
}

export async function getEvents(): Promise<EventListItem[]> {
  const events = await prisma.event.findMany({
    where: publicEventWhere,

    include: eventListInclude,

    orderBy: [
      {
        startDate: "asc",
      },
      {
        id: "asc",
      },
    ],
  });

  const counts = await getRegisteredCounts(events.map((event) => event.id));

  return events.map((event) =>
    serializeEvent(event, counts.get(event.id) ?? 0),
  );
}

export async function getEventBySlug(
  slug: string,
): Promise<EventDetail | null> {
  const event = await prisma.event.findFirst({
    where: {
      slug,
      ...publicEventWhere,
    },

    include: eventDetailInclude,
  });

  if (!event) {
    return null;
  }

  const registeredCount = await getRegisteredCount(event.id);

  return serializeEventDetail(event, registeredCount);
}

export async function getUpcomingEvents(
  limit = 6,
  now = new Date(),
): Promise<EventListItem[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const events = await prisma.event.findMany({
    where: {
      ...publicEventWhere,

      endDate: {
        gt: now,
      },
    },

    include: eventListInclude,

    orderBy: [
      {
        startDate: "asc",
      },
      {
        id: "asc",
      },
    ],

    take: safeLimit,
  });

  const counts = await getRegisteredCounts(events.map((event) => event.id));

  return events.map((event) =>
    serializeEvent(event, counts.get(event.id) ?? 0),
  );
}

export async function getRelatedEvents(
  slug: string,
  limit = 3,
  now = new Date(),
): Promise<EventListItem[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 20);

  const currentEvent = await prisma.event.findFirst({
    where: {
      slug,
      ...publicEventWhere,
    },

    select: {
      id: true,
      categoryId: true,
    },
  });

  if (!currentEvent) {
    return [];
  }

  const candidateLimit = Math.max(safeLimit * 3, 10);

  const events = await prisma.event.findMany({
    where: {
      ...publicEventWhere,

      id: {
        not: currentEvent.id,
      },

      endDate: {
        gt: now,
      },
    },

    include: eventListInclude,

    orderBy: [
      {
        startDate: "asc",
      },
      {
        id: "asc",
      },
    ],

    take: candidateLimit,
  });

  const sortedEvents = events.sort((a, b) => {
    const aSameCategory = a.categoryId === currentEvent.categoryId;

    const bSameCategory = b.categoryId === currentEvent.categoryId;

    if (aSameCategory && !bSameCategory) {
      return -1;
    }

    if (!aSameCategory && bSameCategory) {
      return 1;
    }

    const dateDifference = a.startDate.getTime() - b.startDate.getTime();

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return a.id - b.id;
  });

  const selected = sortedEvents.slice(0, safeLimit);

  const counts = await getRegisteredCounts(selected.map((event) => event.id));

  return selected.map((event) =>
    serializeEvent(event, counts.get(event.id) ?? 0),
  );
}

/*
 * ============================================================
 * EVENT FACETS
 * ============================================================
 *
 * Digunakan oleh event listing/filter.
 */

export async function getEventFacets() {
  const [categories, focusAreas, formatRows] = await Promise.all([
    prisma.eventCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    }),

    prisma.eventFocusArea.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    }),

    prisma.event.findMany({
      where: publicEventWhere,
      distinct: ["format"],
      select: {
        format: true,
      },
      orderBy: {
        format: "asc",
      },
    }),
  ]);

  return {
    categories,

    focusAreas,

    formats: formatRows.map((item) => item.format),
  };
}
