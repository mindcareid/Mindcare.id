import { Map } from "lucide-react";

export default function CentreMapPlaceholder() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted p-6 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-card">
        <Map className="size-5 text-muted-foreground" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-foreground">Map view</p>
      <p className="max-w-[22rem] text-[13px] leading-relaxed text-muted-foreground">
        Centre locations are not published yet, so nothing is plotted here. This
        panel follows the same filters as the list beside it.
      </p>
    </div>
  );
}
