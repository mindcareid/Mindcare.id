"use client";

import { CATEGORY_LABEL, CATEGORY_STYLE } from "../type/article";
import type { ArticleCategory } from "../type/article";

interface Props {
  categoryCount: Record<string, number>;
  total: number;
}

const Category: ArticleCategory[] = [
  "CORPORATE",
  "INSIGHT",
  "UPDATE",
  "EVENT",
  "EXECUTIVE",
];

export function NewsSidebar({ categoryCount, total }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-4">
          By category
        </p>
        <div className="flex flex-col gap-3">
          {Category.map((cat) => {
            const count = categoryCount[cat] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const { bar } = CATEGORY_STYLE[cat];

            return (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-gray-700 w-20 shrink-0">
                  {CATEGORY_LABEL[cat]}
                </span>
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 w-7 text-right tabular-nums">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
