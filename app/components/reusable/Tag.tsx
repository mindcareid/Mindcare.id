import { cn } from "@/lib/utils";
export type TagTone = "lavender" | "mint";

const toneStyles: Record<TagTone, string> = {
  lavender: "bg-brand-lavender-100 text-secondary",
  mint: "bg-brand-mint-100 text-accent",
};

type TagProps = {
  children: React.ReactNode;
  tone?: TagTone;
  className?: string;
};

export default function Tag({
  children,
  tone = "lavender",
  className,
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-1 text-[13px] font-medium leading-none",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
