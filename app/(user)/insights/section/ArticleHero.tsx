import { Blob, LeafOrnament } from "@/app/components/reusable/Ornaments";
import Container from "@/app/components/reusable/Container";
import MetaRow from "@/app/components/reusable/MetaRow";
import Tag from "@/app/components/reusable/Tag";
import { Clock, CalendarDays } from "lucide-react";
import type { Article } from "../type/article";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

type ArticleHeroProps = {
  article: Article;
};

export default function ArticleHero({ article }: ArticleHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <Blob
          tone="mint"
          className="absolute -left-24 -top-24 size-72 opacity-70"
        />
        <Blob
          tone="lavender"
          className="absolute -right-16 top-32 size-64 opacity-60"
        />
        <LeafOrnament className="absolute right-6 top-0 hidden h-56 lg:block" />
      </div>

      <Container className="py-12 md:py-16">
        <div className="max-w-3xl">
          <Tag>{article.topic.name}</Tag>

          <h1 className="mt-4 font-heading text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground md:text-[40px] lg:text-[46px]">
            {article.title}
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="flex items-center gap-3">
              <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-lavender-200 text-sm font-semibold text-secondary">
                <span aria-hidden="true">{initialsOf(article.author.name)}</span>
              </span>
              <span className="text-sm">
                <span className="block font-semibold text-foreground">
                  {article.author.name}
                </span>
                <span className="block text-muted-foreground">
                  {article.author.credentials}
                </span>
              </span>
            </span>

            <MetaRow
              items={[
                {
                  icon: CalendarDays,
                  text: dateFormatter.format(new Date(article.publishedAt)),
                },
                {
                  icon: Clock,
                  text: `${article.readTimeMinutes} min read`,
                },
              ]}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
