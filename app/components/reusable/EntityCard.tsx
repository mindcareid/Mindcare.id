import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { buttonStyles, type ButtonVariant } from "./buttonStyles";
import Tag, { type TagTone } from "./Tag";
import MetaRow, { type MetaItem } from "./MetaRow";
import StatusDot, { type StatusKind } from "./StatusDot";
import VerifiedBadge from "./VerifiedBadge";
export type EntityCardTag = {
  label: string;
  tone?: TagTone;
};

type EntityCardProps = {
  href: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  imageAlt?: string;
  verified?: boolean;
  status?: StatusKind;
  statusLabel?: string;
  tags?: EntityCardTag[];
  maxTags?: number;
  meta?: MetaItem[];
  footnote?: string;
  actionLabel: string;
  actionVariant?: ButtonVariant;
  className?: string;
};

function initialsOf(name: string) {
  return name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((part) => /^[A-Za-z]/.test(part))
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export default function EntityCard({
  href,
  title,
  subtitle,
  imageUrl,
  imageAlt,
  verified = false,
  status,
  statusLabel,
  tags = [],
  maxTags = 3,
  meta,
  footnote,
  actionLabel,
  actionVariant = "primary",
  className,
}: EntityCardProps) {
  const shownTags = tags.slice(0, maxTags);
  const hiddenTagCount = tags.length - shownTags.length;

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        "shadow-card transition-shadow duration-300 hover:shadow-card-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="relative h-44 w-full overflow-hidden bg-brand-lavender-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-linear-to-br from-brand-lavender-200 to-brand-mint-200 font-heading text-4xl font-semibold text-primary/60"
          >
            {initialsOf(title)}
          </span>
        )}

        {(verified || status) && (
          <div className="absolute left-3 top-3 flex items-center gap-2">
            {verified && <VerifiedBadge />}
            {status && (
              <span className="inline-flex items-center rounded-sm border border-border bg-card px-2 py-1">
                <StatusDot status={status} label={statusLabel} />
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-heading text-xl font-semibold leading-snug text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {shownTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {shownTags.map((tag) => (
              <Tag key={tag.label} tone={tag.tone}>
                {tag.label}
              </Tag>
            ))}
            {hiddenTagCount > 0 && (
              <span className="text-[13px] font-medium text-muted-foreground">
                +{hiddenTagCount}
              </span>
            )}
          </div>
        )}

        {meta && meta.length > 0 && <MetaRow items={meta} />}
        <div className="mt-auto pt-2">
          {footnote && (
            <p className="mb-3 text-sm font-semibold text-foreground">
              {footnote}
            </p>
          )}
          <span
            className={buttonStyles({
              variant: actionVariant,
              className: "w-full",
            })}
          >
            {actionLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
