import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "outline"
  | "ghost"
  | "danger";
type ButtonSize = "sm" | "md" | "lg";
const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-brand-navy-800",
  secondary: "bg-secondary text-secondary-foreground hover:bg-brand-purple-700",
  accent: "bg-accent text-accent-foreground hover:bg-brand-emerald-700",
  outline: "border border-primary bg-card text-primary hover:bg-primary/5",
  ghost: "text-foreground hover:bg-muted",
  danger: "bg-destructive text-white hover:bg-destructive/90",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-5 py-3 gap-2.5",
};
const baseStyles = [
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:opacity-50 disabled:cursor-not-allowed",
];
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}

export type { ButtonVariant, ButtonSize };
