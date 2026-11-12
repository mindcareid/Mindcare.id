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
      revalidatePath(`${basePath}/${slug}`);
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
    revalidatePath("/professionals");
    revalidatePath("/");
  });
}
export function revalidateProfessionalDetail(slug: string | null | undefined) {
  safeRevalidate(() => {
    if (!slug) return;
    revalidatePath(`/professionals/${slug}`);
    revalidatePath("/professionals/[slug]", "page");
  });
}
export function revalidateCareCentreDetail(slug: string | null | undefined) {
  safeRevalidate(() => {
    if (!slug) return;
    revalidatePath(`/care-centres/${slug}`);
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
    revalidatePath("/care-centres");
    revalidatePath("/");
  });
}

export function revalidateHeroCache() {
  safeRevalidate(() => {
    revalidatePath("/");
  });
}
export function revalidateHomepageCache() {
  safeRevalidate(() => {
    revalidatePath("/");
  });
}
