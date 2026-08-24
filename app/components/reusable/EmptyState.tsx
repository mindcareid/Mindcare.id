import type { ComponentType } from "react";
import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";


type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
};

export default function EmptyState({
  title = "No results found",
  description = "Try removing a filter or searching with a different keyword.",
  icon: Icon = SearchX,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center",
        className,
      )}
    >
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-brand-lavender-100">
        <Icon className="size-6 text-secondary" aria-hidden="true" />
      </span>
      <h3 className="font-heading text-xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-base text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
