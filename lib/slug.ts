import slugify from "slugify";

type FindTaken = (candidate: string) => Promise<boolean>;

export async function generateUniqueSlug(
  name: string,
  fallbackPrefix: string,
  isTaken: FindTaken,
): Promise<string> {
  const base =
    slugify(name, { lower: true, strict: true, trim: true }) || fallbackPrefix;

  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  return `${base}-${Date.now()}`;
}
