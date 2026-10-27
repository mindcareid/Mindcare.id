import { Clock, MapPin } from "lucide-react";
import EntityCard, {
  type EntityCardTag,
} from "@/app/components/reusable/EntityCard";
import EmptyState from "@/app/components/reusable/EmptyState";
import type { MetaItem } from "@/app/components/reusable/MetaRow";
import { cn } from "@/lib/utils";
import { isOpenAt, summariseTodayHours } from "../data/centreHours";
import { verificationLabelOf } from "../../data/verification";
import type { CareCentre } from "../type/careCentre";

function metaOf(centre: CareCentre, now: string): MetaItem[] {
  return [
    { icon: MapPin, text: centre.address.city },
    { icon: Clock, text: summariseTodayHours(centre, now) },
  ];
}

function tagsOf(centre: CareCentre): EntityCardTag[] {
  const tags: EntityCardTag[] = [];
  if (centre.acceptsBpjs) {
    tags.push({ label: "BPJS", tone: "mint" });
  }

  for (const service of centre.services) {
    tags.push({ label: service.name, tone: "lavender" });
  }

  return tags;
}

type CareCentresGridProps = {
  centres: CareCentre[];
  now: string;
  className?: string;
  /** Copy untuk konteks tanpa filter, mis. preview di homepage. */
  emptyState?: { title: string; description: string };
};

export default function CareCentresGrid({
  centres,
  now,
  className,
  emptyState,
}: CareCentresGridProps) {
  if (centres.length === 0) {
    return (
      <EmptyState
        title={emptyState?.title ?? "No centres match your filters"}
        description={
          emptyState?.description ??
          "Try widening the city filter, or clear it. There may be a centre nearby under a different service."
        }
        className={className}
      />
    );
  }

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {centres.map((centre) => (
        <EntityCard
          key={centre.id}
          href={`/care-centres/${centre.slug}`}
          title={centre.name}
          subtitle={centre.kind}
          imageUrl={centre.photoUrl}
          imageAlt={centre.name}
          verifiedLabel={verificationLabelOf(
            centre.verification,
            now,
            "facility",
          )}
          status={isOpenAt(centre, now) ? "open" : undefined}
          tags={tagsOf(centre)}
          meta={metaOf(centre, now)}
          actionLabel="View Centre"
          actionVariant="primary"
        />
      ))}
    </div>
  );
}
