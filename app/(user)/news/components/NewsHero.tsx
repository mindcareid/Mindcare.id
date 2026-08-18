"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils/FormatDate";
import { CategoryBadge } from "./CategoryBadge";
import { CATEGORY_LABEL } from "../type/article";
import type { Article } from "../type/article";

interface Props {
  featured: Article;
  secondary: Article[];
}

export function NewsHero({ featured, secondary }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4 mb-6">
      <Link
        href={`/news/${featured.slug}`}
        className="group relative rounded-2xl overflow-hidden 
        min-h-55 sm:min-h-70 lg:min-h-90 
        flex flex-col justify-end"
      >
        <Image
          src={featured.coverImage || "/images/placeholder.png"}
          alt={featured.title}
          fill
          sizes="(max-width: 1024px) 100vw, 63vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-[10px] font-semibold tracking-widest uppercase text-blue-300">
              Featured · {CATEGORY_LABEL[featured.category]}
            </span>
          </div>

          <h2 className="text-base sm:text-lg lg:text-xl font-semibold leading-tight text-slate-100 mb-2 sm:mb-3 group-hover:text-white transition-colors">
            {featured.title}
          </h2>

          <div className="flex items-center gap-3 mt-3">
            <span className="text-[11px] text-slate-400">
              {featured.publishedAt
                ? formatDate(featured.publishedAt)
                : "Draft"}
            </span>

            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
              {featured.type}
            </span>

            <span className="ml-auto text-[11px] text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform">
              Read →
            </span>
          </div>
        </div>
      </Link>

      {/* ===== SECONDARY ===== */}
      <div
        className="
        flex gap-3 
        overflow-x-auto pb-1
        lg:flex-col lg:overflow-visible
      "
      >
        {secondary.slice(0, 3).map((article) => (
          <Link
            key={article.publicId}
            href={`/news/${article.slug}`}
            className="
              group relative 
              min-w-55 sm:min-w-60 lg:min-w-0
              h-35 sm:h-40 lg:h-auto
              rounded-2xl border border-gray-100 overflow-hidden 
              flex flex-col justify-end
            "
          >
            {/* Image */}
            <Image
              src={article.coverImage || "/images/placeholder.png"}
              alt={article.title}
              fill
              sizes="(max-width: 1024px) 100vw, 37vw"
              className="object-cover  group-hover:scale-105 transition-transform duration-500"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/85 via-slate-900/30 to-transparent" />

            {/* Content */}
            <div className="relative z-10 p-3 sm:p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <CategoryBadge category={article.category} />
                <span className="text-[10px] text-slate-400 font-medium">
                  {article.type}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-white leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors">
                {article.title}
              </p>

              <p className="text-[10px] text-slate-400">
                {article.publishedAt
                  ? formatDate(article.publishedAt)
                  : "Draft"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
