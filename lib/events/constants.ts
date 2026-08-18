import type { EventFilters, EventPrice, EventType } from "./types";

export function isExternalEvent(event: {
  externalUrl?: string | null;
}): boolean {
  return Boolean(event.externalUrl);
}

export const EVENTS_PAGE_LIMIT = 9;

export const HOME_EVENTS_LIMIT = 6;

export const MAX_EVENTS_LIMIT = 50;

export function clampEventLimit(
  value: string | number | null | undefined,
  fallback: number = EVENTS_PAGE_LIMIT,
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(Math.max(Math.trunc(parsed), 1), MAX_EVENTS_LIMIT);
}

export function clampEventPage(
  value: string | number | null | undefined,
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) return 1;

  return Math.trunc(parsed);
}

export const DEFAULT_EVENT_FILTERS: EventFilters = {
  search: "",
  category: "all",
  industry: "all",
  type: "upcoming",
  price: "all",
  page: 1,
};
export type EventSearchParamsInput = {
  q?: string | null;
  search?: string | null;
  category?: string | null;
  industry?: string | null;
  type?: string | null;
  price?: string | null;
  page?: string | null;
};

export function resolveEventFilters(
  input: EventSearchParamsInput,
  initialSearch = "",
): EventFilters {
  const search = input.q ?? input.search ?? initialSearch;

  return {
    search,
    category: input.category ?? DEFAULT_EVENT_FILTERS.category,
    industry: input.industry ?? DEFAULT_EVENT_FILTERS.industry,
    type:
      (input.type as EventType) ??
      (search ? "all" : DEFAULT_EVENT_FILTERS.type),
    price: (input.price as EventPrice) ?? DEFAULT_EVENT_FILTERS.price,
    page: clampEventPage(input.page),
  };
}

/** EventFilters (state UI, pakai "all") → GetEventsParams (query, pakai undefined). */
export function filtersToQueryParams(filters: EventFilters) {
  return {
    page: filters.page,
    search: filters.search || undefined,
    category: filters.category !== "all" ? filters.category : undefined,
    industry: filters.industry !== "all" ? filters.industry : undefined,
    type: filters.type !== "all" ? filters.type : undefined,
    price: filters.price !== "all" ? filters.price : undefined,
  };
}
