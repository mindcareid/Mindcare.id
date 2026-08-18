"use client";

import { useEffect, useState } from "react";
import type { Article } from "./type/article";
import { useNewsFilter } from "./hooks/useNewsFilter";
import { MdArticle } from "react-icons/md";
import { NewsTopbar } from "./components/NewsTopbar";
import { NewsHero } from "./components/NewsHero";
import { ArticleGrid } from "./components/ArticleGrid";
import { TrendingList } from "./components/TrendingList";
import { NewsSidebar } from "./components/NewsSidebar";
import {
  HeroSkeleton,
  GridSkeleton,
  SidebarSkeleton,
} from "./components/NewsSkeletons";

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { activeFilter, setActiveFilter, filtered, categoryCount, total } =
    useNewsFilter(articles);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/articles?published=true");
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const data = await res.json();
        setArticles(data.data ?? []);
      } catch (err) {
        setError("Could not load articles. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const [heroArticle, ...rest] = filtered;
  const sideArticles = rest.slice(0, 3);
  const gridArticles = rest.slice(3);
  const filterLatest = filtered.length >= 4;
  const trendingArticles = filtered.slice(0, 4);
  const isFiltered = activeFilter !== "ALL";

  return (
    <section className="min-h-screen bg-gray-50  py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <NewsTopbar active={activeFilter} onChange={setActiveFilter} />
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}
        {loading && (
          <>
            <HeroSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 mt-6">
              <GridSkeleton />
              <SidebarSkeleton />
            </div>
          </>
        )}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <MdArticle className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              No articles found
            </h3>
            <p className="text-xs text-gray-500 max-w-xs">
              Try selecting a different category or check back later for new
              content.
            </p>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <>
            {!isFiltered && heroArticle && filterLatest && (
              <NewsHero featured={heroArticle} secondary={sideArticles} />
            )}
            <div className="grid grid-cols-1  gap-6">
              <ArticleGrid
                articles={
                  isFiltered ? filtered : filterLatest ? gridArticles : filtered
                }
              />
              {!isFiltered && (
                <div className="flex flex-col gap-6">
                  <TrendingList articles={trendingArticles} />
                  <NewsSidebar categoryCount={categoryCount} total={total} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
