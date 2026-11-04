export const SPONSOR_STATUSES = ["PENDING", "REVIEWED", "ARCHIVED"] as const;
export type SponsorStatus = (typeof SPONSOR_STATUSES)[number];

export const SPONSOR_STATUS_LABEL: Record<SponsorStatus, string> = {
  PENDING: "New",
  REVIEWED: "Reviewed",
  ARCHIVED: "Archived",
};

export const PIC_TITLES = [
  "Mr",
  "Mrs",
  "Ms",
  "Dr",
  "Prof",
  "Ir",
  "Drs",
  "Hj",
  "Hjh",
] as const;

export type SponsorBenefit = {
  title: string;
  detail?: string;
};

export type SponsorTierAdmin = {
  id: number;
  name: string;
  priceAmount: number;
  currency: string;
  displayUsd: number | null;
  benefits: SponsorBenefit[];
  fxRateUsed: number | null;
  isActive: boolean;
  sortOrder: number;
  applicationCount: number;
};

export const SPONSOR_PAGE_SIZE = 25;
export const SPONSOR_MAX_EXPORT_ROWS = 10000;

export type SponsorApplicationFilters = {
  eventId?: number;
  status?: SponsorStatus;
  search?: string;
  page: number;
};

export function parseSponsorFilters(
  searchParams: URLSearchParams,
): SponsorApplicationFilters {
  const eventIdRaw = Number(searchParams.get("eventId"));
  const eventId =
    Number.isInteger(eventIdRaw) && eventIdRaw > 0 ? eventIdRaw : undefined;

  const statusRaw = searchParams.get("status")?.toUpperCase() ?? "";
  const status = (SPONSOR_STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as SponsorStatus)
    : undefined;

  const search = searchParams.get("search")?.trim() || undefined;

  const pageRaw = Number(searchParams.get("page"));
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  return { eventId, status, search, page };
}

export function buildSponsorFilterParams(
  filters: Omit<SponsorApplicationFilters, "page"> & { page?: number },
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.eventId) params.set("eventId", String(filters.eventId));
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page && filters.page > 1)
    params.set("page", String(filters.page));
  return params;
}
