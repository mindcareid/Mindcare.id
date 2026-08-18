import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils/FormatDate";
import { stripHtml } from "@/lib/utils/stripHtml";
import { CategoryBadge } from "./CategoryBadge";
import type { Article } from "../type/article";
import { MdArticle } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa";

interface Props {
  articles: Article[];
}

export function ArticleGrid({ articles }: Props) {
  if (articles.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">
          Latest articles
        </p>
        <p className="text-xs text-gray-400">
          {articles.length} article{articles.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {articles.map((article) => (
          <Link
            key={article.publicId}
            href={`/news/${article.slug}`}
            className="group bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="relative h-44 w-full shrink-0 bg-gray-100">
              <Image
                src={article.coverImage || "/images/placeholder.png"}
                alt={article.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover  transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <CategoryBadge category={article.category} />
              </div>
            </div>
            <div className="flex flex-col gap-2.5 p-5 flex-1">
              <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
                {article.type}
              </span>
              <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {stripHtml(article.content) || "No description available."}
              </p>
              <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] md:text-[12px] text-gray-400">
                  {article.publishedAt
                    ? formatDate(article.publishedAt)
                    : "Draft"}
                </span>
                <FaArrowRight className="text-xs text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
