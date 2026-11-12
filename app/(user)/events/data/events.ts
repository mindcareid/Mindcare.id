import { EventStatus, OrderStatus, Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import { PLATFORM_NAME, PLATFORM_SLUG } from "@/lib/events/constants";
import {
  getPublicSponsorTiers,
  normalizeBenefits,
} from "@/lib/sponsors/queries";
import type { SponsorBenefit } from "@/lib/sponsors/shared";
import {
  EVENT_CACHE_REVALIDATE,
  eventTag,
} from "@/lib/events/cache";

const eventListInclude = {
  category: true,

  professional: true,

  careCentre: true,

  platform: true,

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

  platform: true,

  agenda: {
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      // Pivot sesi -> speaker; nama dibaca dari `speakers` di bawah.
      speakers: {
        orderBy: { sortOrder: "asc" },
        select: { speakerId: true, role: true },
      },
    },
  },

  industries: true,

  attendeeFields: true,

  // Speaker & agenda MindCare. Selalu dibaca (satu query) dan hanya dipakai
  // kalau publisher-nya PLATFORM; lihat design.md bagian 33.
  speakers: { orderBy: { sortOrder: "asc" } },

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
  /** Hanya diisi untuk host PLATFORM: logo akun platform. */
  logoUrl?: string | null;
  /** Hanya diisi untuk host PLATFORM: badge "Official MindCare". */
  isVerified?: boolean;
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
  canDownloadProposal: boolean;

  /**
   * Paket sponsor yang aktif. Kosong berarti section sponsorship tidak
   * dirender sama sekali (event lama tidak dipaksa punya paket).
   */
  sponsorTiers: {
    id: number;
    name: string;
    priceAmount: number;
    currency: string;
    displayUsd: number | null;
    benefits: SponsorBenefit[];
  }[];
};

const publicEventWhere = {
  deletedAt: null,
  status: EventStatus.PUBLISHED,
} satisfies Prisma.EventWhereInput;

function resolveEventHost(
  event: Pick<
    EventListPayload,
    "publisherType" | "professional" | "careCentre" | "platform"
  >,
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

  const isPlatform = event.publisherType === "PLATFORM";

  return {
    name: event.platform?.name ?? PLATFORM_NAME,
    slug: event.platform?.slug ?? PLATFORM_SLUG,
    type: "PLATFORM",
    logoUrl: isPlatform ? (event.platform?.logoUrl ?? null) : null,
    isVerified: isPlatform ? (event.platform?.isVerified ?? false) : false,
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
  hasProposal: boolean,
  sponsorTiers: EventDetail["sponsorTiers"],
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
    canDownloadProposal: event.publisherType === "PLATFORM" && hasProposal,
    sponsorTiers,
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

export async function getPublicEventSlugs(): Promise<string[]> {
  const rows = await prisma.event.findMany({
    where: publicEventWhere,
    select: { slug: true },
  });

  return rows.map((row) => row.slug);
}

/**
 * Factory cache di-memoize per (slug, withTiers) agar `unstable_cache`
 * tidak dialokasikan ulang pada setiap request, sementara tag per-slug
 * tetap bisa dipakai untuk invalidasi.
 */
const eventBySlugCache = new Map<
  string,
  () => Promise<EventDetail | null>
>();

function getCachedEventBySlug(slug: string, withTiers: boolean) {
  const key = `${slug}:${withTiers}`;
  let cached = eventBySlugCache.get(key);

  if (!cached) {
    cached = unstable_cache(
      () => loadEventBySlug(slug, withTiers),
      ["event-by-slug", slug, String(withTiers)],
      {
        revalidate: EVENT_CACHE_REVALIDATE,
        tags: [eventTag(slug)],
      },
    );
    eventBySlugCache.set(key, cached);
  }

  return cached;
}

export async function getEventBySlug(
  slug: string,
  { withTiers = true }: { withTiers?: boolean } = {},
): Promise<EventDetail | null> {
  const cached = await getCachedEventBySlug(slug, withTiers)();

  if (!cached) {
    return null;
  }
  return reviveEventDates(cached);
}
const DATE_KEYS = new Set([
  "startDate",
  "endDate",
  "startTime",
  "endTime",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "publishedAt",
]);

function reviveEventDates(event: EventDetail): EventDetail {
  return reviveDatesDeep(event) as EventDetail;
}

function reviveDatesDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => reviveDatesDeep(item)) as unknown as T;
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    const result: Record<string, unknown> = {};

    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      if (DATE_KEYS.has(key) && typeof raw === "string") {
        const parsed = new Date(raw);
        // Jangan ubah nilai yang bukan tanggal valid (mis. null).
        result[key] = Number.isNaN(parsed.getTime()) ? raw : parsed;
        continue;
      }

      result[key] = reviveDatesDeep(raw);
    }

    return result as T;
  }

  return value;
}

async function loadEventBySlug(
  slug: string,
  withTiers: boolean,
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
  const [registeredCount, proposal] = await Promise.all([
    getRegisteredCount(event.id),
    prisma.event.findUnique({
      where: { id: event.id },
      select: { proposalUrl: true },
    }),
  ]);
  const tiers =
    withTiers && event.publisherType === "PLATFORM"
      ? await getPublicSponsorTiers(event.id)
      : [];

  return serializeEventDetail(
    event,
    registeredCount,
    Boolean(proposal?.proposalUrl),
    tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      priceAmount: tier.priceAmount,
      currency: tier.currency,
      displayUsd: tier.displayUsd,
      benefits: normalizeBenefits(tier.benefits),
    })),
  );
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

/**
 * Related events di-cache (bukan ISR, karena `now` berubah tiap request)
 * dengan tag yang sama dengan detail event, agar setiap mutasi event
 * ikut menyegarkan daftar "event terkait". Jumlah registrasi bisa
 * berubah tanpa mutasi event, jadi waktu dibulatkan ke jendela
 * `EVENT_CACHE_REVALIDATE`.
 */
const relatedEventsCache = new Map<
  string,
  () => Promise<EventListItem[]>
>();

function getCachedRelatedEvents(
  slug: string,
  limit: number,
  timeBucket: number,
) {
  const key = `${slug}:${limit}:${timeBucket}`;
  let cached = relatedEventsCache.get(key);

  if (!cached) {
    cached = unstable_cache(
      () => loadRelatedEvents(slug, limit, new Date(timeBucket)),
      ["event-related", slug, String(limit), String(timeBucket)],
      {
        revalidate: EVENT_CACHE_REVALIDATE,
        tags: [eventTag(slug)],
      },
    );
    relatedEventsCache.set(key, cached);
  }

  return cached;
}

export async function getRelatedEvents(
  slug: string,
  limit = 3,
  now = new Date(),
): Promise<EventListItem[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 20);
  const bucketMs = EVENT_CACHE_REVALIDATE * 1000;
  const timeBucket = Math.floor(now.getTime() / bucketMs) * bucketMs;

  return getCachedRelatedEvents(slug, safeLimit, timeBucket)();
}

async function loadRelatedEvents(
  slug: string,
  safeLimit: number,
  now: Date,
): Promise<EventListItem[]> {
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
