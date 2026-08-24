"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";

type SearchBarProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  submitLabel?: string;
  onSubmit?: () => void;
  className?: string;
};

export default function SearchBar({
  value,
  onValueChange,
  placeholder = "Search by name, profession, or area of support...",
  submitLabel,
  onSubmit,
  className,
}: SearchBarProps) {
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-card p-2 shadow-search",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
    >
      <span className="pl-2 text-muted-foreground">
        <Search className="size-5" aria-hidden="true" />
      </span>

      <input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        // outline-none aman di sini karena cincin fokus dipindah ke wadahnya
        className="min-w-0 flex-1 bg-transparent py-2 text-base text-foreground outline-none placeholder:text-muted-foreground"
      />

      {value !== "" && (
        <button
          type="button"
          onClick={() => onValueChange("")}
          aria-label="Clear search"
          className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}

      {submitLabel && (
        <Button type="submit" size="md" icon={Search}>
          {submitLabel}
        </Button>
      )}
    </form>
  );
}
