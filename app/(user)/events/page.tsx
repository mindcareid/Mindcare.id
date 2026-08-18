// app/(user)/events/page.tsx

import { Suspense } from "react";

import EventClient from "./EventClient";

import {
  getEvents,
  getEventCategories,
  getIndustries,
} from "@/lib/events/queries";

import {
  EVENTS_PAGE_LIMIT,
  filtersToQueryParams,
  resolveEventFilters,
} from "@/lib/events/constants";

export const metadata = {
  title: "Event | Execorner",
  description: "Discover upcoming Executive Corner events",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    search?: string;
    category?: string;
    industry?: string;
    type?: string;
    price?: string;
    page?: string;
  }>;
};

export default async function EventsPage({ searchParams }: Props) {
  const params = await searchParams;

  // Filter awal harus dihitung dengan aturan yang sama persis seperti klien,
  // supaya initialData React Query cocok dan tidak refetch di render pertama.
  const initialFilters = resolveEventFilters(params);

  const eventsPromise = getEvents({
    ...filtersToQueryParams(initialFilters),
    limit: EVENTS_PAGE_LIMIT,
  });

  const categoriesPromise = getEventCategories();

  const industriesPromise = getIndustries();

  const [eventsResult, categories, industries] = await Promise.all([
    eventsPromise,
    categoriesPromise,
    industriesPromise,
  ]);

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <EventClient
        initialEvents={eventsResult.data}
        initialMeta={eventsResult.meta}
        initialFilters={initialFilters}
        initialCategories={categories}
        initialIndustries={industries}
      />
    </Suspense>
  );
}
