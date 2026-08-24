import { MapPinned } from "lucide-react";
import { cn } from "@/lib/utils";

type CentresMapPlaceholderProps = {
  caption?: string;
  className?: string;
};

export default function CentresMapPlaceholder({
  caption,
  className,
}: CentresMapPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label="Map placeholder. The interactive map is not part of this phase."
      className={cn(
        "flex aspect-4/3 w-full flex-col items-center justify-center gap-3",
        "rounded-xl border border-dashed border-border bg-muted p-6 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-card">
        <MapPinned
          className="size-6 text-muted-foreground"
          aria-hidden="true"
        />
      </span>

      <p className="font-heading text-xl font-semibold text-foreground">
        Map view
      </p>
      <p className="max-w-xs text-sm text-muted-foreground">
        The interactive map arrives with geocoding. Locations are listed below
        in the meantime.
      </p>

      {caption && (
        <p className="text-[13px] font-medium text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  );
}
