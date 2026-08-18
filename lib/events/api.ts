import { EVENTS_PAGE_LIMIT } from "./constants";
import type { EventCardItem, EventMeta, GetEventsParams } from "./types";

type EventsResponse = {
  data: EventCardItem[];
  meta: EventMeta;
};

export async function fetchEvents(
  params: GetEventsParams,
): Promise<EventsResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? EVENTS_PAGE_LIMIT));

  if (params.search) searchParams.set("search", params.search);
  if (params.category) searchParams.set("category", params.category);
  if (params.industry) searchParams.set("industry", params.industry);
  if (params.type && params.type !== "all")
    searchParams.set("type", params.type);
  if (params.price && params.price !== "all")
    searchParams.set("price", params.price);

  const res = await fetch(`/api/events?${searchParams.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch events");
  }
  return res.json();
}
