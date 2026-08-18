import { clampEventLimit, clampEventPage } from "./constants";
import type { GetEventsParams } from "./types";

export function parseEventParams(
  searchParams: URLSearchParams,
): GetEventsParams {
  return {
    search: searchParams.get("search") ?? undefined,

    category: searchParams.get("category") ?? undefined,

    industry: searchParams.get("industry") ?? undefined,

    type: (searchParams.get("type") as GetEventsParams["type"]) ?? undefined,

    price: (searchParams.get("price") as GetEventsParams["price"]) ?? undefined,

    page: clampEventPage(searchParams.get("page")),

    limit: clampEventLimit(searchParams.get("limit")),
  };
}
