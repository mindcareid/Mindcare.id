import { Prisma, type EventSponsorApplication } from "@prisma/client";

import prisma from "@/lib/prisma";
import {
  SPONSOR_PAGE_SIZE,
  type EventSponsorAdmin,
  type SponsorApplicationFilters,
  type SponsorBenefit,
} from "@/lib/sponsors/shared";
import { E164_PATTERN, phoneStartsWithAnyDialCode } from "@/lib/sponsors/phone";

export const SPONSOR_PUBLIC_EVENT_WHERE = {
  publisherType: "PLATFORM" as const,
  status: "PUBLISHED" as const,
  deletedAt: null,
};

export function isSponsorshipEnded(
  endDate: Date,
  now: Date = new Date(),
): boolean {
  return endDate.getTime() <= now.getTime();
}

export function normalizeBenefits(
  value: Prisma.JsonValue | null,
): SponsorBenefit[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const title = typeof item.title === "string" ? item.title : "";
    const detail = typeof item.detail === "string" ? item.detail : undefined;
    return title ? [{ title, ...(detail ? { detail } : {}) }] : [];
  });
}

export async function getPublicSponsorTiers(eventId: number) {
  return prisma.eventSponsorTier.findMany({
    where: { eventId, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { priceAmount: "desc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      priceAmount: true,
      currency: true,
      displayUsd: true,
      benefits: true,
    },
  });
}

/**
 * Dipakai GET /api/cadmin/events/[id]/sponsor-tiers. Query yang sama pernah
 * di-inline di route itu; sekarang satu sumber saja.
 */
export async function listAdminSponsorTiers(eventId: number) {
  const tiers = await prisma.eventSponsorTier.findMany({
    where: { eventId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      priceAmount: true,
      currency: true,
      displayUsd: true,
      fxRateUsed: true,
      benefits: true,
      isActive: true,
      sortOrder: true,
      _count: { select: { applications: true } },
    },
  });

  return tiers.map(({ _count, benefits, ...tier }) => ({
    ...tier,
    benefits: normalizeBenefits(benefits),
    applicationCount: _count.applications,
  }));
}

export const SPONSOR_EVENT_FILTER_LIMIT = 100;

export async function listPlatformEventsForFilter() {
  return prisma.event.findMany({
    where: { deletedAt: null, publisherType: "PLATFORM" },
    orderBy: [{ startDate: "desc" }, { id: "desc" }],
    take: SPONSOR_EVENT_FILTER_LIMIT,
    select: { id: true, title: true, startDate: true },
  });
}

export type PublicSponsorGroup = {
  tierId: number;
  tierName: string;
  tierSortOrder: number;
  sponsors: {
    id: number;
    name: string;
    logoUrl: string;
    websiteUrl: string | null;
  }[];
};

export async function getPublicSponsorGroups(
  eventId: number,
): Promise<PublicSponsorGroup[]> {
  const tiers = await prisma.eventSponsorTier.findMany({
    where: { eventId, sponsors: { some: { isActive: true } } },
    orderBy: [{ sortOrder: "asc" }, { priceAmount: "desc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      sortOrder: true,
      sponsors: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: {
          id: true,
          name: true,
          logoUrl: true,
          websiteUrl: true,
        },
      },
    },
  });

  return tiers.map((tier) => ({
    tierId: tier.id,
    tierName: tier.name,
    tierSortOrder: tier.sortOrder,
    sponsors: tier.sponsors,
  }));
}

export async function listAdminEventSponsors(
  eventId: number,
): Promise<EventSponsorAdmin[]> {
  const rows = await prisma.eventSponsor.findMany({
    where: { eventId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      tierId: true,
      name: true,
      logoUrl: true,
      logoPublicId: true,
      websiteUrl: true,
      isActive: true,
      sortOrder: true,
      tier: { select: { name: true } },
    },
  });

  return rows.map(({ tier, ...sponsor }) => ({
    ...sponsor,
    tierName: tier.name,
  }));
}

export async function listSponsorTierOptions(eventId: number) {
  return prisma.eventSponsorTier.findMany({
    where: { eventId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, name: true, isActive: true },
  });
}

const listSelect = {
  id: true,
  referenceNo: true,
  status: true,
  companyName: true,
  website: true,
  countryCode: true,
  picFirstName: true,
  picLastName: true,
  picTitle: true,
  picEmail: true,
  picPhone: true,
  priceAmountSnapshot: true,
  currencySnapshot: true,
  displayUsdSnapshot: true,
  createdAt: true,
  emailSentAt: true,
  event: { select: { id: true, title: true, slug: true } },
  tier: { select: { id: true, name: true, isActive: true } },
} satisfies Prisma.EventSponsorApplicationSelect;

export function buildSponsorWhere(
  filters: SponsorApplicationFilters,
): Prisma.EventSponsorApplicationWhereInput {
  const where: Prisma.EventSponsorApplicationWhereInput = {};

  if (filters.eventId) where.eventId = filters.eventId;
  if (filters.status) where.status = filters.status;

  if (filters.search) {
    const q = filters.search;
    where.OR = [
      { companyName: { contains: q } },
      { referenceNo: { contains: q } },
      { picEmail: { contains: q } },
      { picFirstName: { contains: q } },
      { picLastName: { contains: q } },
      { picPhone: { contains: q } },
    ];
  }

  return where;
}

export async function loadSponsorApplications(
  filters: SponsorApplicationFilters,
) {
  const where = buildSponsorWhere(filters);

  const [total, rows] = await Promise.all([
    prisma.eventSponsorApplication.count({ where }),
    prisma.eventSponsorApplication.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (filters.page - 1) * SPONSOR_PAGE_SIZE,
      take: SPONSOR_PAGE_SIZE,
      select: listSelect,
    }),
  ]);

  return { rows, total };
}

export async function loadSponsorSummary(
  filters: Pick<SponsorApplicationFilters, "eventId" | "search">,
) {
  const base = buildSponsorWhere({ ...filters, page: 1 });
  const [pending, reviewed, archived] = await Promise.all([
    prisma.eventSponsorApplication.count({
      where: { ...base, status: "PENDING" },
    }),
    prisma.eventSponsorApplication.count({
      where: { ...base, status: "REVIEWED" },
    }),
    prisma.eventSponsorApplication.count({
      where: { ...base, status: "ARCHIVED" },
    }),
  ]);

  return { pending, reviewed, archived, total: pending + reviewed + archived };
}

const detailSelect = {
  ...listSelect,
  address: true,
  website: true,
  companyEmail: true,
  picPosition: true,
  notes: true,
  emailError: true,
  updatedAt: true,
  benefitsSnapshot: true,
  tier: {
    select: {
      id: true,
      name: true,
      isActive: true,
      priceAmount: true,
      benefits: true,
    },
  },
} satisfies Prisma.EventSponsorApplicationSelect;

export type SponsorApplicationDetail =
  Prisma.EventSponsorApplicationGetPayload<{
    select: typeof detailSelect;
  }>;

export async function findSponsorApplication(id: number) {
  return prisma.eventSponsorApplication.findUnique({
    where: { id },
    select: detailSelect,
  });
}

export async function updateSponsorApplicationStatus(
  id: number,
  status: EventSponsorApplication["status"],
) {
  return prisma.eventSponsorApplication.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });
}

export async function loadSponsorApplicationsForExport(
  filters: Omit<SponsorApplicationFilters, "page">,
  maxRows: number,
) {
  const where = buildSponsorWhere({ ...filters, page: 1 });

  const total = await prisma.eventSponsorApplication.count({ where });
  if (total > maxRows) {
    return {
      tooMany: true as const,
      total,
      rows: [] as SponsorApplicationDetail[],
    };
  }

  const rows = await prisma.eventSponsorApplication.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: maxRows,
    select: detailSelect,
  });

  return { tooMany: false as const, total, rows };
}

export async function validateCountryAndPhone(
  { countryCode, phone }: { countryCode: string; phone: string },
  lookup: (
    code: string,
  ) => Promise<{ code: string; callingCode: string | null } | null> = (code) =>
    prisma.country.findUnique({
      where: { code },
      select: { code: true, callingCode: true },
    }),
): Promise<
  | { ok: true }
  | { ok: false; field: "countryCode" | "picPhone"; message: string }
> {
  const country = await lookup(countryCode);

  if (!country) {
    return {
      ok: false,
      field: "countryCode",
      message: "Select the country from the list",
    };
  }
  const isE164 = E164_PATTERN.test(phone);
  const dialCodeMatches = phoneStartsWithAnyDialCode(phone, [
    country.callingCode,
  ]);

  if (!isE164 || !dialCodeMatches) {
    return {
      ok: false,
      field: "picPhone",
      message:
        "This phone number does not match the selected country. Use “Different country” if the contact person is based elsewhere.",
    };
  }

  return { ok: true };
}
