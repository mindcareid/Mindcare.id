import { Info } from "lucide-react";
import Container from "@/app/components/reusable/Container";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import ArticleAuthors from "../section/ArticleAuthors";
import ArticleBody from "../section/ArticleBody";
import ArticleContents from "../section/ArticleContents";
import ArticleHero from "../section/ArticleHero";
import InsightsGrid from "../section/InsightsGrid";
import type { Article } from "../type/article";

type ArticleDetailProps = {
  article: Article;
  related: Article[];
};

export default function ArticleDetail({
  article,
  related,
}: ArticleDetailProps) {
  return (
    <div className="min-h-screen">
      <ArticleHero article={article} />

      <Container className="pb-16 md:pb-24">
        <div className="space-y-14 md:space-y-16">
          <div>
            <ArticleContents blocks={article.body} className="max-w-prose" />

            <ArticleBody blocks={article.body} className="mt-10 max-w-none" />

            <div className="mt-10 flex max-w-prose gap-3 rounded-xl border border-border bg-brand-mint-100 p-5">
              <Info
                className="mt-0.5 size-5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed text-foreground">
                Tulisan ini bersifat edukasi dan tidak menggantikan pemeriksaan
                oleh psikolog atau psikiater. Kalau keluhan yang kamu rasakan
                sudah mengganggu kegiatan sehari-hari, pertimbangkan
                membicarakannya dengan profesional.
              </p>
            </div>
          </div>

          <ArticleAuthors
            author={article.author}
            reviewer={article.reviewer}
            reviewedAt={article.reviewedAt}
          />

          {related.length > 0 && (
            <div>
              <SectionHeader
                title="More from Insights"
                href="/insights"
                underline
              />
              <InsightsGrid articles={related} className="mt-6" />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
