import { revalidatePath } from "next/cache";

function safeRevalidate(work: () => void) {
  try {
    work();
  } catch (error) {
    console.error("[PUBLIC_CACHE_REVALIDATE]", error);
  }
}

function revalidateSlugs(
  basePath: string,
  slugs: Array<string | null | undefined>,
) {
  for (const slug of slugs) {
    if (slug) {
      revalidatePath(`${basePath}/${slug}`, "page");
    }
  }
}

export function revalidateProfessionalCache(
  ...entries: Array<{ slug?: string | null } | null | undefined>
) {
  safeRevalidate(() => {
    revalidateSlugs(
      "/professionals",
      entries.map((entry) => entry?.slug),
    );
    revalidatePath("/professionals/[slug]", "page");
    revalidatePath("/professionals", "page");
    revalidatePath("/", "layout");
  });
}
export function revalidateProfessionalDetail(slug: string | null | undefined) {
  safeRevalidate(() => {
    if (!slug) return;
    revalidatePath(`/professionals/${slug}`, "page");
    revalidatePath("/professionals/[slug]", "page");
    revalidatePath("/professionals", "page");
    revalidatePath("/", "layout");
  });
}
export function revalidateCareCentreDetail(slug: string | null | undefined) {
  safeRevalidate(() => {
    if (!slug) return;
    revalidatePath(`/care-centres/${slug}`, "page");
    revalidatePath("/care-centres/[slug]", "page");
    revalidatePath("/care-centres", "page");
    revalidatePath("/", "layout");
  });
}

export function revalidateCareCentreCache(
  ...entries: Array<{ slug?: string | null } | null | undefined>
) {
  safeRevalidate(() => {
    revalidateSlugs(
      "/care-centres",
      entries.map((entry) => entry?.slug),
    );
    revalidatePath("/care-centres/[slug]", "page");
    revalidatePath("/care-centres", "page");
    revalidatePath("/", "layout");
  });
}

export function revalidateHeroCache() {
  safeRevalidate(() => {
    revalidatePath("/", "layout");
  });
}
export function revalidateHomepageCache() {
  safeRevalidate(() => {
    revalidatePath("/", "layout");
  });
}
