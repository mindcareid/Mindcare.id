"use client";

import { Briefcase, HeartHandshake, MapPin, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfessionalFacets } from "../type/professional";
export type FilterGroup = "professions" | "areas" | "sessionModes" | "cities";

export type ProfessionalFilterState = Record<FilterGroup, string[]>;

export const emptyFilterState: ProfessionalFilterState = {
  professions: [],
  areas: [],
  sessionModes: [],
  cities: [],
};

export function countActiveFilters(state: ProfessionalFilterState) {
  return Object.values(state).reduce((total, list) => total + list.length, 0);
}

type ProfessionalsFilterProps = {
  facets: ProfessionalFacets;
  value: ProfessionalFilterState;
  onToggle: (group: FilterGroup, option: string) => void;
  onReset: () => void;
  className?: string;
};

export default function ProfessionalsFilter({
  facets,
  value,
  onToggle,
  onReset,
  className,
}: ProfessionalsFilterProps) {
  const activeCount = countActiveFilters(value);

  const groups = [
    {
      key: "professions" as const,
      label: "Professionals",
      icon: Briefcase,
      options: facets.professions.map((item) => ({ value: item, label: item })),
      defaultOpen: true,
    },
    {
      key: "areas" as const,
      label: "Area of support",
      icon: HeartHandshake,
      // value memakai slug, bukan nama tampilan — lihat catatan di type/professional.ts
      options: facets.areasOfSupport.map((area) => ({
        value: area.slug,
        label: area.name,
      })),
      defaultOpen: true,
    },
    {
      key: "sessionModes" as const,
      label: "Session mode",
      icon: Video,
      options: facets.sessionModes.map((item) => ({
        value: item,
        label: item,
      })),
      defaultOpen: false,
    },
    {
      key: "cities" as const,
      label: "City",
      icon: MapPin,
      options: facets.cities.map((item) => ({ value: item, label: item })),
      defaultOpen: false,
    },
  ];

  return (
    <aside
      aria-label="Filters"
      className={cn(
        "rounded-xl bg-linear-to-b from-brand-lavender-100 to-brand-mint-200 p-4",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3 px-1">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Filters
        </h2>
        <button
          type="button"
          onClick={onReset}
          disabled={activeCount === 0}
          className={cn(
            "rounded-sm px-2 py-1 text-sm font-semibold transition-colors",
            "text-secondary hover:bg-card/70",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
          )}
        >
          Reset all
        </button>
      </div>

      <div className="space-y-3">
        {groups.map((group) => {
          const Icon = group.icon;
          const selected = value[group.key];

          return (
            <details
              key={group.key}
              open={group.defaultOpen}
              className="group rounded-lg bg-card shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-foreground">
                <Icon className="size-4 text-secondary" aria-hidden="true" />
                <span className="flex-1">{group.label}</span>
                {selected.length > 0 && (
                  <span className="rounded-sm bg-brand-lavender-100 px-1.5 py-0.5 text-[13px] font-semibold text-secondary">
                    {selected.length}
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className="ml-1 size-2 rotate-45 border-b-2 border-r-2 border-muted-foreground transition-transform group-open:-rotate-135"
                />
              </summary>

              <div className="max-h-56 space-y-1 overflow-y-auto px-4 pb-4">
                {group.options.map((option) => {
                  const checked = selected.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2.5 rounded-sm py-1.5 text-sm text-foreground hover:text-secondary"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(group.key, option.value)}
                        className="size-4 shrink-0 cursor-pointer rounded-sm accent-secondary"
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </aside>
  );
}
