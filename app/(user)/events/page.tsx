import type { Metadata } from "next";
import Events from "./Events";
import { getEventFacets, getEvents } from "./data/events";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Webinars, workshops, training, and support groups on mental health across Indonesia.",
};

export default async function EventsPage() {
  const [events, facets] = await Promise.all([getEvents(), getEventFacets()]);

  const now = new Date().toISOString();

  return <Events events={events} facets={facets} now={now} />;
}
