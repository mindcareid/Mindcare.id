import type { Metadata } from "next";
import Events from "./Events";
import { getEventFacets, getEvents } from "./data/events";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Webinars, workshops, training, and support groups on mental health across Indonesia.",
};

// Alasannya sama dengan `[slug]/page.tsx`: `now` di bawah menentukan mana yang
// "Sold out" dan mana yang "Event has ended", dan tanpa ini nilainya membeku di
// jam build. Halaman daftar bahkan lebih terasa — filter "When" akan menyaring
// terhadap tanggal yang sudah usang.
export const revalidate = 3600;

export default async function EventsPage() {
  const [events, facets] = await Promise.all([getEvents(), getEventFacets()]);

  const now = new Date().toISOString();

  return <Events events={events} facets={facets} now={now} />;
}
