export type ProposalDownloadFilters = {
  eventId?: number;
  search?: string;
  page: number;
};

export const PAGE_SIZE = 25;
export const MAX_EXPORT_ROWS = 10000;

export function parseFilters(
  searchParams: URLSearchParams,
): ProposalDownloadFilters {
  const eventIdRaw = Number(searchParams.get("eventId"));
  const eventId =
    Number.isInteger(eventIdRaw) && eventIdRaw > 0 ? eventIdRaw : undefined;

  const search = searchParams.get("search")?.trim() || undefined;

  const pageRaw = Number(searchParams.get("page"));
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  return { eventId, search, page };
}

export function buildFilterParams(
  filters: Omit<ProposalDownloadFilters, "page"> & { page?: number },
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.eventId) params.set("eventId", String(filters.eventId));
  if (filters.search) params.set("search", filters.search);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  return params;
}
