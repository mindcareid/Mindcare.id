import { CalendarCheck, Clock, MapPin, Video } from "lucide-react";
import EntityCard, {
  type EntityCardTag,
} from "@/app/components/reusable/EntityCard";
import EmptyState from "@/app/components/reusable/EmptyState";
import type { ButtonVariant } from "@/app/components/reusable/buttonStyles";
import type { MetaItem } from "@/app/components/reusable/MetaRow";
import { cn } from "@/lib/utils";
import type { Solution, SolutionTheme } from "../type/solution";

const actionVariantByTheme: Record<SolutionTheme, ButtonVariant> = {
  navy: "primary",
  purple: "secondary",
  emerald: "accent",
};

function metaOf(solution: Solution): MetaItem[] {
  const isOnline = solution.deliveryModes.includes("Online");

  return [
    {
      icon: CalendarCheck,
      text: `${solution.sessionCount} ${
        solution.sessionCount === 1 ? "session" : "sessions"
      }`,
    },
    { icon: Clock, text: `${solution.sessionMinutes} min` },
    {
      icon: isOnline ? Video : MapPin,
      text: solution.deliveryModes.join(" & "),
    },
  ];
}

function tagsOf(solution: Solution): EntityCardTag[] {
  return [
    // Nada mint dipakai untuk kategori supaya terbaca beda dari focus area.
    // Nada yang cocok dengan warna tombol per kategori (navy) belum ada di
    // `Tag` — lihat catatan di design.md pasal 11.
    { label: solution.category.name, tone: "mint" },
    ...solution.focusAreas.map((area) => ({
      label: area.name,
      tone: "lavender" as const,
    })),
  ];
}

function footnoteOf(solution: Solution): string | undefined {
  if (solution.partners.length === 0) return undefined;
  return `Delivered with ${solution.partners
    .map((partner) => partner.name)
    .join(" & ")}`;
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
        title="No solutions yet"
        description="Programmes are published once a partner and a lead clinician are confirmed."
        className={className}
      />
    );
  }

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {solutions.map((solution) => (
        <EntityCard
          key={solution.id}
          href={`/solutions/${solution.slug}`}
          title={solution.title}
          subtitle={solution.summary}
          imageUrl={solution.coverImageUrl}
          imageAlt={solution.title}
          tags={tagsOf(solution)}
          meta={metaOf(solution)}
          footnote={footnoteOf(solution)}
          actionLabel="View Solution"
          actionVariant={actionVariantByTheme[solution.category.theme]}
        />
      ))}
    </div>
  );
}
