"use client";
import type { IconType } from "react-icons";
import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx"; // atau pakai `cn` helper kalau sudah ada di /lib/utils

type ButtonVariant = "primary" | "sub" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

// Extend dari ButtonHTMLAttributes biar semua native props (onClick, type, disabled, dll)
// otomatis ke-cover tanpa perlu didefinisikan manual satu-satu
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconType;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-900 text-white hover:bg-blue-800",
  sub: "bg-purple-900 text-white hover:bg-purple-800",
  outline: "border border-indigo-600 text-indigo-600 hover:bg-indigo-50",
  ghost: "text-slate-700 hover:bg-slate-100",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-5 py-3 gap-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  isLoading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="h-4 w-4" />}
          {children}
          {Icon && iconPosition === "right" && <Icon className="h-4 w-4" />}
        </>
      )}
    </button>
  );
}
