"use client";

import { memo, useMemo } from "react";
import FilterPill from "./FilterPill";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  options: readonly FilterOption<T>[];
  onChange: (value: T) => void;
};

function FilterPillGroup<T extends string>({
  value,
  options,
  onChange,
}: Props<T>) {
  const items = useMemo(
    () =>
      options.map((option) => (
        <FilterPill
          key={option.value}
          active={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </FilterPill>
      )),
    [options, value, onChange],
  );

  return (
    <div className="flex flex-wrap gap-2">
      {items}
    </div>
  );
}

export default memo(FilterPillGroup) as typeof FilterPillGroup;