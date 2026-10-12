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
    bg: "bg-brand-lavender-100",
    text: "text-primary",
    bar: "bg-primary",
  },
  EXECUTIVE: {
    bg: "bg-brand-mint-100",
    text: "text-muted-foreground",
    bar: "bg-brand-mint-200",
  },
  INSIGHT: {
    bg: "bg-brand-lavender-100",
    text: "text-secondary",
    bar: "bg-secondary",
  },
  UPDATE: {
    bg: "bg-brand-mint-100",
    text: "text-accent",
    bar: "bg-accent",
  },
  EVENT: {
    bg: "bg-brand-mint-100",
    text: "text-muted-foreground",
    bar: "bg-brand-mint-200",
  },
};
