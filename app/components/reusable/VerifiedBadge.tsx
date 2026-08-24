import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
type VerifiedBadgeProps = {
  label?: string;
  className?: string;
};

export default function VerifiedBadge({
  label = "Verified",
  className,
}: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2 py-1",
        "text-[13px] font-medium leading-none text-foreground",
        className,
      )}
    >
      <BadgeCheck className="size-3.5 text-accent" aria-hidden="true" />
      {label}
    </span>
  );
}
