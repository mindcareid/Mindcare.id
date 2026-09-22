import { Clock, MapPin, Users } from "lucide-react";
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
  const listed = centre.professionalSlugs.length;

  return [
    { icon: MapPin, text: centre.address.city },
    { icon: Clock, text: summariseTodayHours(centre, now) },
    {
      icon: Users,
      text: `${listed} ${listed === 1 ? "professional" : "professionals"} listed`,
    },
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
};

export default function CareCentresGrid({
  centres,
  now,
  className,
}: CareCentresGridProps) {
  if (centres.length === 0) {
    return (
      <EmptyState
        title="No centres match your filters"
        description="Try widening the city or clearing a filter there may be a centre nearby under a different service."
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
