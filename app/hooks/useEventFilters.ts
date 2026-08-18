"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { useDebounce } from "./useDebounce";
import {
  DEFAULT_EVENT_FILTERS as DEFAULT_FILTERS,
  resolveEventFilters,
} from "@/lib/events/constants";
import type {
  ApplyFiltersPayload,
  EventFilters,
  EventPrice,
  EventType,
} from "@/lib/events/types";

function filtersFromSearchParams(
  params: URLSearchParams,
  initialSearch: string,
): EventFilters {
  return resolveEventFilters(
    {
      q: params.get("q"),
      category: params.get("category"),
      industry: params.get("industry"),
      type: params.get("type"),
      price: params.get("price"),
      page: params.get("page"),
    },
    initialSearch,
  );
}

export function useEventFilters(initialSearch = "") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<EventFilters>(() =>
    filtersFromSearchParams(searchParams, initialSearch),
  );

  const [appliedFilters, setAppliedFilters] = useState<EventFilters>(filters);

  const debouncedSearch = useDebounce(filters.search, 1000);

  useEffect(() => {
    setAppliedFilters((prev) =>
      prev.search === debouncedSearch
        ? prev
        : { ...prev, search: debouncedSearch, page: 1 },
    );
  }, [debouncedSearch]);
  useEffect(() => {
    const params = new URLSearchParams();

    if (appliedFilters.search) params.set("q", appliedFilters.search);
    if (appliedFilters.category !== "all")
      params.set("category", appliedFilters.category);
    if (appliedFilters.industry !== "all")
      params.set("industry", appliedFilters.industry);
    if (appliedFilters.price !== "all")
      params.set("price", appliedFilters.price);
    if (appliedFilters.type !== DEFAULT_FILTERS.type)
      params.set("type", appliedFilters.type);
    if (appliedFilters.page !== 1)
      params.set("page", String(appliedFilters.page));

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [appliedFilters, pathname, router]);

  const setSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  const updateCategory = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, category: value }));
    setAppliedFilters((prev) => ({ ...prev, category: value, page: 1 }));
  }, []);

  const updateIndustry = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, industry: value }));
    setAppliedFilters((prev) => ({ ...prev, industry: value, page: 1 }));
  }, []);

  const updatePrice = useCallback((value: EventPrice) => {
    setFilters((prev) => ({ ...prev, price: value }));
    setAppliedFilters((prev) => ({ ...prev, price: value, page: 1 }));
  }, []);

  const updateType = useCallback((value: EventType) => {
    setFilters((prev) => ({ ...prev, type: value }));
    setAppliedFilters((prev) => ({ ...prev, type: value, page: 1 }));
  }, []);

  const updatePage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    setAppliedFilters((prev) => ({ ...prev, page }));
  }, []);

  const applyFilters = useCallback((payload: ApplyFiltersPayload) => {
    setFilters((prev) => ({ ...prev, ...payload, page: 1 }));
    setAppliedFilters((prev) => ({ ...prev, ...payload, page: 1 }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    appliedFilters,
    setSearch,
    updateCategory,
    updateIndustry,
    updatePrice,
    updateType,
    updatePage,
    applyFilters,
    resetFilter,
  };
}
