import { EventStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

const eventListInclude = {
  category: true,

  professional: true,

  careCentre: true,

  solution: true,

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

  _count: {
    select: {
      orders: {
        where: {
          status: "PAID",
        },
      },
    },
  },
} satisfies Prisma.EventInclude;

const eventDetailInclude = {
  category: true,

  professional: true,

  careCentre: true,

  solution: true,

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

  _count: {
    select: {
      orders: {
        where: {
          status: "PAID",
        },
      },
    },
  },
} satisfies Prisma.EventInclude;

type EventListPayload = Prisma.EventGetPayload<{
  include: typeof eventListInclude;
}>;

type EventDetailPayload = Prisma.EventGetPayload<{
  include: typeof eventDetailInclude;
}>;

export type EventHost = {
  name: string;
  type: "PLATFORM" | "PROFESSIONAL" | "CARE_CENTRE" | "SOLUTION";
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

/*
 * ============================================================
 * COMMON WHERE
 * ============================================================
 *
 * Public event hanya:
 * - belum dihapus
 * - status PUBLISHED
 *
 * Jangan masukkan deletedAt di setiap query secara manual.
 */

const publicEventWhere = {
  deletedAt: null,
  status: EventStatus.PUBLISHED,
} satisfies Prisma.EventWhereInput;

/*
 * ============================================================
 * HOST RESOLVER
 * ============================================================
 *
 * Satu event bisa diterbitkan oleh:
 *
 * 1. Professional
 * 2. Care Centre
 * 3. Solution
 * 4. Platform / MindCare
 *
 * Kita normalisasi menjadi satu object "host"
 * supaya UI tidak perlu memahami struktur database.
 */

function resolveEventHost(
  event: Pick<
    EventListPayload,
    "professional" | "careCentre" | "solution"
  >,
): EventHost {
  if (event.professional) {
    return {
      name: event.professional.fullName,
      type: "PROFESSIONAL",
    };
  }

  if (event.careCentre) {
    return {
      name: event.careCentre.name,
      type: "CARE_CENTRE",
    };
  }

  if (event.solution) {
    return {
      name: event.solution.name,
      type: "SOLUTION",
    };
  }

  return {
    name: "MindCare",
    type: "PLATFORM",
  };
}

/*
 * ============================================================
 * FOCUS AREA RESOLVER
 * ============================================================
 *
 * Database:
 *
 * Event
 *   ↓
 * EventFocusAreaMap
 *   ↓
 * EventFocusArea
 *
 * Frontend cukup menerima:
 *
 * focusAreas: [
 *   {
 *     id,
 *     slug,
 *     name
 *   }
 * ]
 */

function resolveFocusAreas(
  event: Pick<EventListPayload, "focusAreas">,
): EventFocusArea[] {
  return event.focusAreas.map(({ focusArea }) => ({
    id: focusArea.id,
    slug: focusArea.slug,
    name: focusArea.name,
  }));
}

/*
 * ============================================================
 * SERIALIZE EVENT
 * ============================================================
 */

function serializeEvent(
  event: EventListPayload,
): EventListItem {
  const registeredCount = event._count.orders;

  const remaining =
    event.quota === null
      ? null
      : Math.max(event.quota - registeredCount, 0);

  return {
    ...event,
    host: resolveEventHost(event),
    focusAreas: resolveFocusAreas(event),
    registeredCount,
    remaining,
    soldOut:
      event.quota !== null && remaining === 0,
  };
}

function serializeEventDetail(
  event: EventDetailPayload,
): EventDetail {
  const registeredCount = event._count.orders;

  const remaining =
    event.quota === null
      ? null
      : Math.max(
        event.quota - registeredCount,
        0,
      );

  const soldOut =
    event.quota !== null &&
    remaining === 0;
  return {
    ...event,

    host: resolveEventHost(event),

    focusAreas: resolveFocusAreas(event),

    registeredCount,

    remaining,

    soldOut,
  };
}

/*
 * ============================================================
 * GET ALL EVENTS
 * ============================================================
 */

export async function getEvents(): Promise<EventListItem[]> {
  const events = await prisma.event.findMany({
    where: publicEventWhere,

    include: {
      ...eventListInclude,
      _count: {
        select: {
          orders: {
            where: {
              status: "PAID",
            },
          },
        },
      },
    },

    orderBy: [
      {
        startDate: "asc",
      },
      {
        id: "asc",
      },
    ],
  });

  //return events.map(serializeEvent);
  return events.map((event) => {
    const registeredCount = event._count.orders;

    const remaining =
      event.quota === null
        ? null
        : Math.max(event.quota - registeredCount, 0);

    const soldOut =
      event.quota !== null && remaining === 0;

    return {
      ...serializeEvent(event),
      registeredCount,
      remaining,
      soldOut,
    };
  });
}

/*
 * ============================================================
 * GET EVENT BY SLUG
 * ============================================================
 */

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

  return serializeEventDetail(event);
}

/*
 * ============================================================
 * GET UPCOMING EVENTS
 * ============================================================
 */

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

  return events.map(serializeEvent);
}

/*
 * ============================================================
 * GET RELATED EVENTS
 * ============================================================
 *
 * Priority:
 *
 * 1. Same category
 * 2. Upcoming date
 *
 * Kita mengambil kandidat lebih banyak terlebih dahulu,
 * kemudian melakukan prioritization di application layer.
 */

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
    const aSameCategory =
      a.categoryId === currentEvent.categoryId;

    const bSameCategory =
      b.categoryId === currentEvent.categoryId;

    if (aSameCategory && !bSameCategory) {
      return -1;
    }

    if (!aSameCategory && bSameCategory) {
      return 1;
    }

    const dateDifference =
      a.startDate.getTime() - b.startDate.getTime();

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return a.id - b.id;
  });

  return sortedEvents
    .slice(0, safeLimit)
    .map(serializeEvent);
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