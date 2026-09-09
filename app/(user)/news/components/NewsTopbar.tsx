"use client";

import { cn } from "@/lib/utils";
import type { FilterValue } from "../hooks/useNewsFilter";
import Image from "next/image";
const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "ALL" },
  { label: "Corporate", value: "CORPORATE" },
  { label: "Insight", value: "INSIGHT" },
  { label: "Update", value: "UPDATE" },
  { label: "Event", value: "EVENT" },
  { label: "Executive", value: "EXECUTIVE" },
];

interface Props {
  active: FilterValue;
  onChange: (v: FilterValue) => void;
}

export function NewsTopbar({ active, onChange }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-5 border-b border-gray-100">
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
          <Image
            src="/images/icon/iconMindcare.ico"
            alt="Execorner"
            width={50}
            height={50}
            className="object-contain"
          />
        </div>
        <div>
          <p className="text-sm md:text-md font-semibold text-gray-900 leading-none">
            News
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Curated for professionals
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 ">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value as FilterValue)}
            className={cn(
              "text-[12px] font-medium px-2.5 py-1.5 rounded-full border transition-all duration-150",
              active === filter.value
                ? "bg-slate-900 text-white border-gray-900 font-medium"
                : "bg-white text-gray-500 border-slate-900 hover:bg-gray-50",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
