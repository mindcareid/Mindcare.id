import { Clock, MapPin, Users } from "lucide-react";
import EntityCard, {
  type EntityCardTag,
} from "@/app/components/reusable/EntityCard";
import EmptyState from "@/app/components/reusable/EmptyState";
import type { MetaItem } from "@/app/components/reusable/MetaRow";
import { cn } from "@/lib/utils";
import type { CareCentre } from "../type/careCentre";

// Server-safe: tidak ada state di sini. State pencarian dan filter dipegang
// `CareCentres.tsx`, sesuai rules.md pasal 4 (dorong batas client sedalam
// mungkin).

function metaOf(centre: CareCentre): MetaItem[] {
  return [
    { icon: MapPin, text: centre.address.city },
    { icon: Clock, text: centre.openingHours },
    {
      icon: Users,
      text: `${centre.professionalCount} ${
        centre.professionalCount === 1 ? "professional" : "professionals"
      }`,
    },
  ];
}

function tagsOf(centre: CareCentre): EntityCardTag[] {
  const tags: EntityCardTag[] = [];

  // BPJS ditaruh PALING DEPAN dengan sengaja. `EntityCard` memotong tag di tag
  // ketiga, dan bagi orang yang mencari layanan kesehatan mental di Indonesia,
  // "ditanggung BPJS atau tidak" hampir selalu informasi paling menentukan —
  // jangan sampai ia yang kena potong.
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
  className?: string;
};

export default function CareCentresGrid({
  centres,
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
          verified={centre.isVerified}
          status={centre.isOpenNow ? "open" : undefined}
          tags={tagsOf(centre)}
          meta={metaOf(centre)}
          actionLabel="View Centre"
          actionVariant="primary"
        />
      ))}
    </div>
  );
}
