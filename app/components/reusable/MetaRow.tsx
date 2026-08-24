import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export type MetaItem = {
  icon?: ComponentType<{ className?: string }>;
  text: string;
};

type MetaRowProps = {
  items: MetaItem[];
  className?: string;
};

export default function MetaRow({ items, className }: MetaRowProps) {
  const visible = items.filter((item) => item.text.trim() !== "");
  if (visible.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-muted-foreground",
        className,
      )}
    >
      {visible.map((item, index) => {
        const Icon = item.icon;
        return (
          <span
            key={`${item.text}-${index}`}
            className="inline-flex items-center gap-2"
          >
            {index > 0 && (
              <span aria-hidden="true" className="text-border">
                &middot;
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              {Icon && <Icon className="size-3.5 shrink-0" />}
              {item.text}
            </span>
          </span>
        );
      })}
    </div>
  );
}
