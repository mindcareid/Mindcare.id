import { cn } from "@/lib/utils";
import type { ArticleBlock } from "../type/article";

type ArticleBodyProps = {
  blocks: ArticleBlock[];
  className?: string;
};

export default function ArticleBody({ blocks, className }: ArticleBodyProps) {
  return (
    <div className={cn("max-w-prose", className)}>
      {blocks.map((block) => {
        switch (block.kind) {
          case "heading":
            return (
              <h2
                key={block.id}
                id={block.id}
                className="mt-10 scroll-mt-24 font-heading text-2xl font-semibold text-foreground first:mt-0 md:text-[28px]"
              >
                {block.text}
              </h2>
            );

          case "paragraph":
            return (
              <p
                key={block.id}
                className="mt-5 text-base leading-relaxed text-foreground first:mt-0"
              >
                {block.text}
              </p>
            );

          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag
                key={block.id}
                className={cn(
                  "mt-5 space-y-2 pl-5 text-base leading-relaxed text-foreground marker:text-secondary",
                  block.ordered ? "list-decimal" : "list-disc",
                )}
              >
                {block.items.map((item, index) => (
                  <li key={`${block.id}-${index}`} className="pl-1">
                    {item}
                  </li>
                ))}
              </ListTag>
            );
          }

          case "quote":
            return (
              <blockquote
                key={block.id}
                className="mt-8 rounded-xl border-l-4 border-secondary bg-brand-lavender-100 p-5"
              >
                <p className="font-heading text-lg leading-relaxed text-foreground">
                  {block.text}
                </p>
                {block.attribution && (
                  <footer className="mt-3 text-sm font-semibold text-secondary">
                    {block.attribution}
                  </footer>
                )}
              </blockquote>
            );

          default: {
            // Kalau nanti ada jenis blok baru di `ArticleBlock`, baris ini yang
            // menggagalkan `tsc` sampai jenis itu ikut dirender di atas.
            const exhaustive: never = block;
            void exhaustive;
            return null;
          }
        }
      })}
    </div>
  );
}
