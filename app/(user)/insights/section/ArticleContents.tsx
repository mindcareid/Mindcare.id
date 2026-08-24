import { cn } from "@/lib/utils";
import type { ArticleBlock } from "../type/article";

type ArticleHeadingBlock = Extract<ArticleBlock, { kind: "heading" }>;

type ArticleContentsProps = {
  blocks: ArticleBlock[];
  className?: string;
};

export default function ArticleContents({
  blocks,
  className,
}: ArticleContentsProps) {
  const headings = blocks.filter(
    (block): block is ArticleHeadingBlock => block.kind === "heading",
  );

  if (headings.length < 3) return null;

  return (
    <nav
      aria-labelledby="article-contents-title"
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-card",
        className,
      )}
    >
      <h2
        id="article-contents-title"
        className="font-heading text-lg font-semibold text-foreground"
      >
        In this article
      </h2>

      <ol className="mt-3 space-y-2 text-base">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className="text-primary underline-offset-4 transition-colors hover:text-brand-navy-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
