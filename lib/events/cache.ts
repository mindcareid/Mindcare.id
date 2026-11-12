import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateHomepageCache } from "@/lib/publicCache";
import prisma from "@/lib/prisma";
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
  revalidateHomepageCache();
}
export async function revalidateEventCacheById(
  ...eventIds: Array<number | null | undefined>
) {
  const ids = eventIds.filter(
    (id): id is number =>
      typeof id === "number" && Number.isInteger(id) && id > 0,
  );
  if (ids.length === 0) return;

  try {
    const rows = await prisma.event.findMany({
      where: { id: { in: ids } },
      select: { slug: true },
    });
    revalidateEventCache(...rows.map((row) => row.slug));
  } catch (error) {
    console.error("[REVALIDATE_EVENT_CACHE_BY_ID]", error);
  }
}
