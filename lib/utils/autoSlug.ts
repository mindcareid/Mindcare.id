// /lib/utils/autoSlug.ts
import slugify from "slugify";

type AutoSlugParams = {
  value: string;
  currentSlug?: string;
  isEdit?: boolean;
  slugTouched?: boolean;
};

export function autoSlug({
  value,
  currentSlug = "",
  isEdit = false,
  slugTouched = false,
}: AutoSlugParams) {
  // edit → jangan auto
  if (isEdit) return currentSlug;

  // user sudah sentuh slug → jangan override
  if (slugTouched) return currentSlug;

  return slugify(value, { lower: true, strict: true });
}
