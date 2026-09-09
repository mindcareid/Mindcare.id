import { cn } from "@/lib/utils";

export function LeafOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      aria-hidden="true"
      className={cn("opacity-35", className)}
    >
      <path
        d="M96 236C96 236 88 168 104 116C118 70 148 34 168 12"
        stroke="var(--brand-emerald-600)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* daun kiri */}
      <path
        d="M100 196C76 190 58 170 54 146C80 148 98 166 100 196Z"
        stroke="var(--brand-emerald-600)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M100 150C84 142 70 120 70 96C95 102 108 122 106 150Z"
        stroke="var(--brand-purple-600)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* daun kanan */}
      <path
        d="M112 172C134 162 140 128 144 114C122 120 100 144 95 172Z"
        stroke="var(--brand-purple-600)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M124 118C144 106 152 82 148 60C128 72 120 92 124 118Z"
        stroke="var(--brand-emerald-600)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M140 72C156 58 160 34 154 14C138 30 134 50 140 72Z"
        stroke="var(--brand-purple-600)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function Blob({
  tone = "lavender",
  className,
}: {
  tone?: "lavender" | "mint";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ borderRadius: "58% 42% 39% 61% / 47% 55% 45% 53%" }}
      className={cn(
        "blur-2xl",
        tone === "lavender" ? "bg-brand-lavender-200" : "bg-brand-mint-200",
        className,
      )}
    />
  );
}

export function SquiggleOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 60"
      fill="none"
      aria-hidden="true"
      className={cn("opacity-35", className)}
    >
      <path
        d="M4 42C28 6 52 6 76 42C100 78 124 78 148 42C172 6 190 12 202 30"
        stroke="var(--brand-purple-600)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="208" cy="38" r="5" fill="var(--brand-purple-600)" />
    </svg>
  );
}
