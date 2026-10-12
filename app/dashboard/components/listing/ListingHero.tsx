import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import ListingStatusBadge, {
  type ListingStatusValue,
} from "./ListingStatusBadge";

export type ListingHeroStat = { label: string; value: string };

export default function ListingHero({
  eyebrow,
  name,
  imageUrl,
  imageAlt,
  status,
  meta,
  editHref,
  stats,
}: {
  eyebrow: string;
  name: string;
  imageUrl?: string | null;
  imageAlt?: string;
  status?: ListingStatusValue;
  meta?: string;
  editHref: string;
  stats?: ListingHeroStat[];
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      {/* Signature bar: the brand's three colours as one thin identity marker. */}
      <div className="h-1.5 w-full bg-linear-to-r from-primary via-secondary to-accent" />

      <div className="p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-brand-lavender-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt ?? name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <span className="font-heading text-xl font-semibold text-secondary">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </span>

          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {eyebrow}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold text-foreground">
                {name}
              </h1>
              {status ? <ListingStatusBadge status={status} /> : null}
            </div>
            {meta ? (
              <p className="text-sm text-muted-foreground">{meta}</p>
            ) : null}
          </div>

          <Link
            href={editHref}
            className={buttonStyles({
              variant: "outline",
              size: "md",
              className: "shrink-0",
            })}
          >
            <Pencil className="size-4" />
            Edit listing
          </Link>
        </div>

        {stats && stats.length > 0 ? (
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-foreground">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
