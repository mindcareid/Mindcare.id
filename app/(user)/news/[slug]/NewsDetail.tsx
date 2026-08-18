"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils/FormatDate";
import type { Article } from "../type/article";
import { CategoryBadge } from "../components/CategoryBadge";
import ShareButton from "../../events/section/ShareButton";
import "react-quill/dist/quill.snow.css";

export default function NewsPageDetail({
  params,
}: {
  params: { slug: string };
}) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(
          `/api/articles?slug=${params.slug}&published=true`,
        );
        if (!res.ok) {
          setArticle(null);
          return;
        }
        const json = await res.json();
        setArticle(json.data || null);
      } catch (err) {
        console.error(err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="relative h-[55vh] w-full bg-gray-200 animate-pulse" />
        <div className="max-w-5xl mx-auto px-6">
          <div className="py-6 border-b border-gray-100">
            <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12 py-10">
            <div className="space-y-4">
              <div className="h-3 w-32 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-full bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
              <div className="space-y-2 pt-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-100 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) return notFound();

  return (
    <article className="mx-auto max-w-7xl my-8">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex min-w-0 max-w-6xl items-center gap-2 px-6 py-3 text-xs font-medium text-gray-400 lg:text-sm">
          <Link
            href="/"
            className="shrink-0 transition-colors hover:text-blue-600"
          >
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            href="/news"
            className="shrink-0 transition-colors hover:text-blue-600"
          >
            News
          </Link>
          <span className="text-gray-300">/</span>
          <span className="truncate text-gray-600">{article.title}</span>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 px-6 py-10 lg:grid-cols-[1fr_240px] lg:gap-12">
        <section>
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600">
                {article.category} · {article.type}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
              {article.title}
            </h1>
          </div>
          <div className="mb-8 flex items-center gap-3 border-b border-gray-100 pb-6">
            <span className="text-sm text-gray-500">
              {article.publishedAt ? formatDate(article.publishedAt) : "Draft"}
            </span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
              {article.type}
            </span>
            <div className="ml-auto lg:hidden">
              <ShareButton title={article.title} context="article" iconOnly />
            </div>
          </div>
          {article.coverImage && (
            <div className="relative mb-8 w-full overflow-hidden rounded-2xl bg-gray-100">
              <Image
                src={article.coverImage}
                alt={article.title}
                width={1200}
                height={675}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          )}

          {article.content ? (
            <div
              className="ql-editor prose prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-p:text-[17px] prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <p className="italic text-gray-400">No content available.</p>
          )}
          <div className="mt-10 lg:hidden">
            <Link
              href="/news"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              <span>←</span>
              Back to News
            </Link>
          </div>
        </section>
        <aside className="sticky top-6 hidden flex-col gap-4 lg:flex">
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Article Info
            </p>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-gray-400">Category</span>
              <CategoryBadge category={article.category} size="md" />
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Type</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                {article.type}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Published</span>
              <span className="text-xs text-gray-600">
                {article.publishedAt ? formatDate(article.publishedAt) : "—"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Share
            </p>
            <ShareButton title={article.title} context="article" />
          </div>
          <Link
            href="/news"
            className="group inline-flex items-center gap-2 px-1 text-sm font-medium text-gray-500 transition-colors hover:text-slate-900"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
            Back to News
          </Link>
        </aside>
      </div>
    </article>
  );
}
