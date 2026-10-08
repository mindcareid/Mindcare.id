import { Building2, Globe, Mail, Phone, Users } from "lucide-react";
import Link from "next/link";

import type { Solution } from "../type/solution";

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type SolutionDetailRailProps = {
  solution: Solution;
};

export default function SolutionDetailRail({
  solution,
}: SolutionDetailRailProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-card">
        <p className="text-xs text-muted-foreground">Provided by</p>
        <p className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
          <Building2 className="size-5 text-secondary" aria-hidden="true" />
          {solution.organizationName}
        </p>

        <dl className="space-y-4 divide-y divide-border">
          <MetaRow label="Category" value={solution.category.name} />
        </dl>

        {solution.website && (
          <Link
            href={solution.website}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Globe className="size-4" aria-hidden="true" />
            {new URL(solution.website).hostname}
          </Link>
        )}
      </div>

      {solution.audiences.length > 0 && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-card">
          <p className="text-xs text-muted-foreground">For</p>
          <div className="flex flex-wrap gap-2">
            {solution.audiences.map((audience) => (
              <span
                key={audience.id}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-lavender-100 px-2.5 py-1 text-xs font-medium text-secondary"
              >
                <Users className="size-3.5" aria-hidden="true" />
                {audience.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-card">
        <p className="text-xs text-muted-foreground">Contact</p>
        <div className="space-y-2 text-sm">
          {solution.contactEmail && (
            <a
              href={`mailto:${solution.contactEmail}`}
              className="flex items-center gap-2 text-foreground hover:text-primary"
            >
              <Mail className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              Send email
            </a>
          )}
          {solution.contactPhone && (
            <p className="flex items-center gap-2 text-foreground">
              <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              {solution.contactPhone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4 first:pt-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
