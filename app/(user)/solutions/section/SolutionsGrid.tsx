import { MapPin } from "lucide-react";
import EntityCard, {
  type EntityCardTag,
} from "@/app/components/reusable/EntityCard";
import EmptyState from "@/app/components/reusable/EmptyState";
import type { MetaItem } from "@/app/components/reusable/MetaRow";
import { cn } from "@/lib/utils";
import type { Solution } from "../type/solution";

function metaOf(solution: Solution): MetaItem[] {
  const items: MetaItem[] = [];

  if (solution.organizationName) {
    items.push({ icon: MapPin, text: solution.organizationName });
  }

  return items;
}

function tagsOf(solution: Solution): EntityCardTag[] {
  return [
    { label: solution.category.name, tone: "mint" },
    ...solution.focusAreas.map((area) => ({
      label: area.name,
      tone: "lavender" as const,
    })),
  ];
}

type SolutionsGridProps = {
  solutions: Solution[];
  className?: string;
};

export default function SolutionsGrid({
  solutions,
  className,
}: SolutionsGridProps) {
  if (solutions.length === 0) {
    return (
      <EmptyState
        title="No solutions match your filters"
        description="Try removing a filter or changing your search terms."
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {solutions.map((solution) => (
        <EntityCard
          key={solution.id}
          href={`/solutions/${solution.slug}`}
          title={solution.title}
          subtitle={solution.organizationName}
          imageUrl={solution.coverImageUrl}
          tags={tagsOf(solution)}
          meta={metaOf(solution)}
          actionLabel="View"
        />
      ))}
    </div>
  );
}
