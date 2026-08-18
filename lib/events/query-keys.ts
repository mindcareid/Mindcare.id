import type { GetEventsParams } from "./types";

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (params: GetEventsParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (slug: string) => [...eventKeys.details(), slug] as const,
};
