"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { fetchEvents } from "@/lib/events/api";
import {
  EVENTS_PAGE_LIMIT,
  filtersToQueryParams,
} from "@/lib/events/constants";
import { eventKeys } from "@/lib/events/query-keys";
import type {
  EventCardItem,
  EventFilters,
  EventMeta,
} from "@/lib/events/types";

// lib/hooks/useEventsQuery.ts
type UseEventsQueryOptions = {
  initialEvents?: EventCardItem[];
  initialMeta?: EventMeta;
  initialFilters?: EventFilters;
  limit?: number;
};

export function useEventsQuery(
  appliedFilters: EventFilters,
  {
    initialEvents,
    initialMeta,
    initialFilters,
    limit = EVENTS_PAGE_LIMIT,
  }: UseEventsQueryOptions = {},
) {
  const queryParams = {
    ...filtersToQueryParams(appliedFilters),
    limit,
  };

  const matchesInitialFilters =
    !!initialFilters &&
    appliedFilters.page === initialFilters.page &&
    appliedFilters.search === initialFilters.search &&
    appliedFilters.category === initialFilters.category &&
    appliedFilters.industry === initialFilters.industry &&
    appliedFilters.price === initialFilters.price &&
    appliedFilters.type === initialFilters.type;

  const shouldPoll =
    appliedFilters.page === 1 &&
    appliedFilters.search === "" &&
    appliedFilters.category === "all" &&
    appliedFilters.industry === "all" &&
    appliedFilters.type === "all" &&
    appliedFilters.price === "all";

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: eventKeys.list(queryParams),
    queryFn: () => fetchEvents(queryParams),
    refetchInterval: shouldPoll ? 60000 : false,
    initialData:
      matchesInitialFilters && initialMeta
        ? { data: initialEvents ?? [], meta: initialMeta }
        : undefined,
    placeholderData: keepPreviousData,
  });

  return {
    events: data?.data ?? [],
    meta: data?.meta ?? null,
    loading: isLoading,
    isFetching,
    error: error instanceof Error ? error.message : null,
  };
}
