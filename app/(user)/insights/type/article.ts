export interface ArticleTopic {
  id: string;
  slug: string;
  name: string;
}

export interface ArticlePerson {
  id: string;
  professionalSlug: string | null;
  name: string;
  credentials: string;
  avatarUrl: string | null;
}

export type ArticleBlock =
  | { kind: "heading"; id: string; text: string }
  | { kind: "paragraph"; id: string; text: string }
  | { kind: "list"; id: string; ordered: boolean; items: string[] }
  | { kind: "quote"; id: string; text: string; attribution: string | null };

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  topic: ArticleTopic;
  author: ArticlePerson;
  reviewer: ArticlePerson | null;
  reviewedAt: string | null;
  publishedAt: string;
  readTimeMinutes: number;
  body: ArticleBlock[];
  createdAt: string;
}
