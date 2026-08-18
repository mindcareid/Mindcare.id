import { CATEGORY_LABEL, CATEGORY_STYLE } from "../type/article";
import type { ArticleCategory } from "../type/article";
import { cn } from "@/lib/utils";

interface Props {
  category: ArticleCategory;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, size = "sm" }: Props) {
  const { bg, text } = CATEGORY_STYLE[category];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium tracking-wide uppercase",
        bg,
        text,
        size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
      )}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}
