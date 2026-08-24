import { cn } from "@/lib/utils";
export type StatusKind = "online" | "open";

type StatusDotProps = {
  status: StatusKind;
  label?: string;
  className?: string;
};

const defaultLabels: Record<StatusKind, string> = {
  online: "Online",
  open: "Open",
};

export default function StatusDot({
  status,
  label,
  className,
}: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[13px] font-medium text-accent",
        className,
      )}
    >
      <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
      {label ?? defaultLabels[status]}
    </span>
  );
}
