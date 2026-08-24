import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
type SectionHeaderProps = {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  underline?: boolean;
  className?: string;
};

export default function SectionHeader({
  title,
  description,
  href,
  linkLabel = "View all",
  underline = false,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4",
        className,
      )}
    >
      <div>
        <h2 className="font-heading text-3xl font-semibold text-foreground">
          {title}
        </h2>
        {underline && (
          <span
            aria-hidden="true"
            className="mt-3 block h-1 w-16 rounded-full bg-secondary"
          />
        )}
        {description && (
          <p className="mt-2 max-w-prose text-base text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-brand-navy-800"
        >
          {linkLabel}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}
