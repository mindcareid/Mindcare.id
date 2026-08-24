import { cn } from "@/lib/utils";
import type { SolutionPartner } from "../type/solution";

type PartnerStripProps = {
  partners: SolutionPartner[];
  className?: string;
};

export default function PartnerStrip({
  partners,
  className,
}: PartnerStripProps) {
  if (partners.length === 0) return null;

  return (
    <ul
      className={cn(
        "flex flex-wrap items-center justify-center gap-4 sm:gap-6",
        className,
      )}
    >
      {partners.map((partner) => (
        <li key={partner.id}>
          <span
            className={cn(
              "inline-flex h-16 items-center justify-center rounded-lg border border-dashed border-border",
              "bg-card px-6 font-heading text-lg font-semibold text-muted-foreground",
            )}
          >
            {partner.name}
          </span>
        </li>
      ))}
    </ul>
  );
}
