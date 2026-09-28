import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type VerifiedBadgeProps = {
  label: string;
  checkedOn?: string | null;
  href?: string | null;
  className?: string;
};

const badgeClassName = cn(
  "inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2 py-1",
  "text-[13px] font-medium leading-none text-foreground",
);

export default function VerifiedBadge({
  label,
  checkedOn,
  href,
  className,
}: VerifiedBadgeProps) {
  const content = (
    <>
      <BadgeCheck className="size-3.5 text-accent" aria-hidden="true" />
      {label}
      {checkedOn && (
        <span className="font-normal text-muted-foreground">
          <span aria-hidden="true"> · </span>
          {checkedOn}
        </span>
      )}
    </>
  );

  if (!href) {
    return <span className={cn(badgeClassName, className)}>{content}</span>;
  }

  return (
    <Link
      href={href}
      aria-label={`${label}${checkedOn ? `, ${checkedOn}` : ""} — read how Mindcare checks listings`}
      className={cn(
        badgeClassName,
        "transition-colors hover:border-accent hover:text-accent",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      {content}
    </Link>
  );
}
