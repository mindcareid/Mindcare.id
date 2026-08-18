"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";

import FilterSection from "./FilterSection";
import FilterSelect from "./FilterSelect";
import FilterPillGroup from "./FilterPillGroup";

import {
  PRICE_OPTIONS,
  DATE_OPTIONS,
} from "./filter.constants";

import type {
  PriceFilter,
  DateFilter,
} from "./filter.types";

export type EventCategory = {
  id: number;
  name: string;
  slug: string;
};

export type Industry = {
  id: number;
  name: string;
  slug: string;
};

export type DraftFilter = {
  category: string;
  industry: string;
  price: PriceFilter;
  date: DateFilter;
};

type Props = {
  mobile?: boolean;

  categories: EventCategory[];
  industries: Industry[];

  draft: DraftFilter;
  setDraft: React.Dispatch<
    React.SetStateAction<DraftFilter>
  >;

  pendingCount: number;

  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
};

function FilterPanel({
  mobile = false,
  categories,
  industries,
  draft,
  setDraft,
  pendingCount,
  onApply,
  onReset,
  onClose,
}: Props) {
  const categoryOptions = useMemo(
    () => [
      {
        value: "all",
        label: "All",
      },
      ...categories.map((item) => ({
        value: item.slug,
        label: item.name,
      })),
    ],
    [categories],
  );

  const industryOptions = useMemo(
    () => [
      {
        value: "all",
        label: "All Industries",
      },
      ...industries.map((item) => ({
        value: item.slug,
        label: item.name,
      })),
    ],
    [industries],
  );

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: mobile ? 1 : 0.96,
        y: mobile ? 0 : 16,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: mobile ? 1 : 0.96,
        y: mobile ? 0 : 16,
      }}
      transition={{
        duration: 0.2,
      }}
      className={`
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-white
        shadow-xl
        ${mobile ? "" : "w-full max-w-xl"}
      `}
    >
      {/* Header */}

      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold">
            Event Filters
          </h2>

          <p className="mt-1 text-sm italic text-muted-foreground">
            Select filters then click Apply
          </p>
        </div>

        <button
          onClick={onClose}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            hover:bg-gray-100
            transition
          "
        >
          <IoClose className="text-lg" />
        </button>
      </div>

      {/* Body */}

      <div className="space-y-6 px-6 py-5">
        <FilterSection title="Categories">
          <FilterPillGroup
            value={draft.category}
            options={categoryOptions}
            onChange={(value) => {
              console.log("CLICK CATEGORY =", value);
              setDraft((prev) => ({
                ...prev,
                category: value,
              }));
            }}
          />
        </FilterSection>

        <FilterSection title="Industry">
          <FilterSelect
            value={draft.industry}
            options={industryOptions}
            placeholder="All Industries"
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                industry: value,
              }))
            }
          />
        </FilterSection>

        <FilterSection title="Price">
          <FilterPillGroup
            value={draft.price}
            options={PRICE_OPTIONS}
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                price: value,
              }))
            }
          />
        </FilterSection>

        <FilterSection title="Event">
          <FilterPillGroup
            value={draft.date}
            options={DATE_OPTIONS}
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                date: value,
              }))
            }
          />
        </FilterSection>
      </div>

      {/* Footer */}

      <div
        className="
          flex
          items-center
          gap-3
          border-t
          border-border
          bg-gray-50
          px-6
          py-5
        "
      >
        <button
          type="button"
          onClick={onReset}
          className="
            h-10
            rounded-xl
            border
            border-border
            bg-white
            px-5
            text-sm
            font-medium
            hover:bg-neutral-900
            hover:text-white
            transition
          "
        >
          Reset
        </button>

        <button
          type="button"
          onClick={() => {
  console.log("APPLY DRAFT =", draft);
  onApply();
}}
          className="
            flex-1
            flex
            items-center
            justify-center
            gap-2
            h-10
            rounded-xl
            bg-neutral-900
            text-white
            text-sm
            font-medium
            hover:bg-neutral-800
            transition
          "
        >
          Apply

          {pendingCount > 0 && (
            <span
              className="
                rounded-full
                bg-white
                px-2
                py-0.5
                text-[11px]
                font-semibold
                text-neutral-900
              "
            >
              {pendingCount}
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default memo(FilterPanel);