import ArticleCard from "@/app/components/reusable/ArticleCard";
import EmptyState from "@/app/components/reusable/EmptyState";
import { cn } from "@/lib/utils";
import type { Article } from "../type/article";

type InsightsGridProps = {
  articles: Article[];
  className?: string;
};

export default function InsightsGrid({
  articles,
  className,
}: InsightsGridProps) {
  if (articles.length === 0) {
    return (
      <EmptyState
        title="No articles yet"
        description="New pieces are reviewed before they go live. Please check back soon."
        className={className}
      />
    );
  }

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          href={`/insights/${article.slug}`}
          title={article.title}
          excerpt={article.excerpt}
          category={article.topic.name}
          imageUrl={article.coverImageUrl}
          author={{
            name: article.author.name,
            role: article.author.credentials,
            avatarUrl: article.author.avatarUrl,
          }}
          reviewer={
            article.reviewer
              ? {
                  name: article.reviewer.name,
                  role: article.reviewer.credentials,
                  avatarUrl: article.reviewer.avatarUrl,
                }
              : undefined
          }
          reviewedAt={article.reviewedAt ?? undefined}
          readTimeMinutes={article.readTimeMinutes}
        />
      ))}
    </div>
  );
}
