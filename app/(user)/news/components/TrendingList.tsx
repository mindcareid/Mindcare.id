import Link from "next/link";
import { formatDate } from "@/lib/utils/FormatDate";
import { CATEGORY_STYLE } from "../type/article";
import type { Article } from "../type/article";

interface Props {
  articles: Article[];
}

export function TrendingList({ articles }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
          Trending this week
        </p>
      </div>

      {articles.map((article, idx) => (
        <Link
          key={article.publicId}
          href={`/news/${article.slug}`}
          className="group flex items-start gap-4 px-5 py-4 border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors"
        >
          <span className="text-xs font-semibold text-gray-300 group-hover:text-blue-600 min-w-5 mt-0.5 tabular-nums">
            {String(idx + 1).padStart(2, "0")}
          </span>

          {/* Konten */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
              {article.title}
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${CATEGORY_STYLE[article.category].bar}`}
              />
              <span className="text-[11px] text-gray-400">
                {article.publishedAt
                  ? formatDate(article.publishedAt)
                  : "Draft"}
              </span>
            </div>
          </div>

          <span className="text-xs text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0">
            →
          </span>
        </Link>
      ))}
    </div>
  );
}
