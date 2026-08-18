"use client";

import EventsFilter from "./section/EventsFilter";
import EventsGrid from "./section/EventsGrid";
import EventsPagination from "./section/EventPagination";
import { useEventFilters } from "@/app/hooks/useEventFilters";
import { useEventsQuery } from "@/app/hooks/useEventsQuery";
import type {
  EventCardItem,
  EventFilters,
  EventMeta,
  EventCategory,
  Industry,
} from "@/lib/events/types";

type Props = {
  initialEvents: EventCardItem[];
  initialMeta: EventMeta;
  initialFilters: EventFilters;
  initialCategories: EventCategory[];
  initialIndustries: Industry[];
};

export default function EventClient({
  initialEvents,
  initialMeta,
  initialFilters,
  initialCategories,
  initialIndustries,
}: Props) {
  const {
    filters,
    appliedFilters,
    setSearch,
    updateCategory,
    updateIndustry,
    updatePrice,
    updateType,
    updatePage,
    applyFilters,
  } = useEventFilters(initialFilters.search);
  const { events, meta, loading, isFetching } = useEventsQuery(appliedFilters, {
    initialEvents,
    initialMeta,
    initialFilters,
  });

  return (
    <main className="min-h-screen">
      <EventsFilter
        searchQuery={filters.search}
        setSearchQuery={setSearch}
        categories={initialCategories}
        selectedCategory={filters.category}
        setSelectedCategory={updateCategory}
        industries={initialIndustries}
        selectedIndustry={filters.industry}
        setSelectedIndustry={updateIndustry}
        priceFilter={filters.price}
        setPriceFilter={updatePrice}
        dateFilter={filters.type}
        setDateFilter={updateType}
        applyFilters={applyFilters}
      />

      <EventsGrid
        events={events}
        totalEvents={meta?.total ?? 0}
        loading={loading}
        isFetching={isFetching}
      />

      {meta && (
        <EventsPagination
          meta={meta}
          currentPage={appliedFilters.page}
          onPageChange={updatePage}
        />
      )}
    </main>
  );
}
