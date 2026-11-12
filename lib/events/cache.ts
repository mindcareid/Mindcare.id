import { revalidatePath, revalidateTag } from "next/cache";
export const EVENT_CACHE_REVALIDATE = 300;

export function eventTag(slug: string) {
  return `event-${slug}`;
}

export function revalidateEventCache(
  ...slugs: Array<string | null | undefined>
) {
  for (const slug of slugs) {
    if (!slug) continue;
    revalidateTag(eventTag(slug));
    revalidatePath(`/events/${slug}`);
  }
  if (slugs.some(Boolean)) {
    revalidatePath("/events/[slug]", "page");
  }

  revalidatePath("/events");
}
