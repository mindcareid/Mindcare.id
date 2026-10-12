import Link from "next/link";
import { formatDate } from "@/lib/utils/FormatDate";
import { CATEGORY_STYLE } from "../type/article";
import type { Article } from "../type/article";

interface Props {
  articles: Article[];
}

export function TrendingList({ articles }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          Trending this week
        </p>
      </div>

      {articles.map((article, idx) => (
        <Link
          key={article.publicId}
          href={`/news/${article.slug}`}
          className="group flex items-start gap-4 px-5 py-4 border-b border-border last:border-none hover:bg-muted transition-colors"
        >
          <span className="text-xs font-semibold text-muted-foreground/60 group-hover:text-primary min-w-5 mt-0.5 tabular-nums">
            {String(idx + 1).padStart(2, "0")}
          </span>

          {/* Konten */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {article.title}
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${CATEGORY_STYLE[article.category].bar}`}
              />
              <span className="text-[11px] text-muted-foreground">
                {article.publishedAt
                  ? formatDate(article.publishedAt)
                  : "Draft"}
              </span>
            </div>
          </div>

          <span className="text-xs text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0">
            →
          </span>
        </Link>
      ))}
    </div>
  );
}
