"use client";

import { useState, useMemo } from "react";
import type { Article, ArticleCategory } from "../type/article";

export type FilterValue = ArticleCategory | "ALL";

export function useNewsFilter(articles: Article[]) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("ALL");

  const filtered = useMemo(() => {
    if (activeFilter === "ALL") return articles;
    return articles.filter((a) => a.category === activeFilter);
  }, [articles, activeFilter]);

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of articles) {
      counts[a.category] = (counts[a.category] ?? 0) + 1;
    }
    return counts;
  }, [articles]);

  return {
    activeFilter,
    setActiveFilter,
    filtered,
    categoryCount,
    total: articles.length,
  };
}
