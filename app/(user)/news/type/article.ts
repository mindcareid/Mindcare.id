export type ArticleCategory =
  | "CORPORATE"
  | "EXECUTIVE"
  | "INSIGHT"
  | "UPDATE"
  | "EVENT";

export type ArticleType = "BLOG" | "NEWS";

export type Article = {
  publicId: string;
  slug: string;
  title: string;
  content?: string;
  coverImage: string;
  category: ArticleCategory;
  type: ArticleType;
  published: boolean;
  publishedAt?: string;
};

export const CATEGORY_LABEL: Record<ArticleCategory, string> = {
  CORPORATE: "Corporate",
  EXECUTIVE: "Executive",
  INSIGHT: "Insight",
  UPDATE: "Update",
  EVENT: "Event",
};

export const CATEGORY_STYLE: Record<
  ArticleCategory,
  { bg: string; text: string; bar: string }
> = {
  CORPORATE: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-800 dark:text-blue-200",
    bar: "bg-blue-500",
  },
  EXECUTIVE: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-200",
    bar: "bg-amber-500",
  },
  INSIGHT: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-800 dark:text-violet-200",
    bar: "bg-violet-500",
  },
  UPDATE: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-200",
    bar: "bg-emerald-500",
  },
  EVENT: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-800 dark:text-rose-200",
    bar: "bg-rose-500",
  },
};
