"use client";

import { memo, useCallback, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { IoFilterSharp } from "react-icons/io5";

import SearchBox from "./filter/SearchBox";
import FilterPanel from "./filter/FilterPanel";
import FilterBadges, { FilterBadge } from "./filter/FilterBadges";

import type {
  EventCategory,
  Industry,
  EventPrice,
  EventType,
  ApplyFiltersPayload,
} from "@/lib/events/types";

type Props = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;

  categories: EventCategory[];

  selectedCategory: string;
  setSelectedCategory: (value: string) => void;

  industries: Industry[];

  selectedIndustry: string;
  setSelectedIndustry: (value: string) => void;

  priceFilter: EventPrice;
  setPriceFilter: (value: EventPrice) => void;

  dateFilter: EventType;
  setDateFilter: (value: EventType) => void;

  applyFilters: (filters: ApplyFiltersPayload) => void;
};

type DraftFilter = {
  category: string;
  industry: string;
  price: EventPrice;
  date: EventType;
};

function EventsFilter({
  searchQuery,
  setSearchQuery,

  categories,

  selectedCategory,
  setSelectedCategory,

  industries,

  selectedIndustry,
  setSelectedIndustry,

  priceFilter,
  setPriceFilter,

  dateFilter,
  setDateFilter,

  applyFilters,
}: Props) {
  const [open, setOpen] = useState(false);

  const [draft, setDraft] = useState<DraftFilter>({
    category: selectedCategory,
    industry: selectedIndustry,
    price: priceFilter,
    date: dateFilter,
  });

  /**
   * Open Filter
   */
  const handleOpen = useCallback(() => {
    setDraft({
      category: selectedCategory,
      industry: selectedIndustry,
      price: priceFilter,
      date: dateFilter,
    });

    setOpen(true);
  }, [selectedCategory, selectedIndustry, priceFilter, dateFilter]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  /**
   * Apply
   */
  const handleApply = useCallback(() => {
    applyFilters({
      category: draft.category,
      industry: draft.industry,
      price: draft.price,
      type: draft.date,
    });

    setOpen(false);
  }, [draft, applyFilters]);

  /**
   * Reset
   */
  const handleReset = useCallback(() => {
    setDraft({
      category: "all",
      industry: "all",
      price: "all",
      date: "all",
    });
  }, []);

  /**
   * Pending
   */
  const pendingCount = useMemo(() => {
    return [
      draft.category !== selectedCategory,

      draft.industry !== selectedIndustry,

      draft.price !== priceFilter,

      draft.date !== dateFilter,
    ].filter(Boolean).length;
  }, [draft, selectedCategory, selectedIndustry, priceFilter, dateFilter]);

  /**
   * Active Filter Count
   */
  const activeFilterCount = useMemo(() => {
    return [
      searchQuery !== "",

      selectedCategory !== "all",

      selectedIndustry !== "all",

      priceFilter !== "all",

      dateFilter !== "all",
    ].filter(Boolean).length;
  }, [
    searchQuery,
    selectedCategory,
    selectedIndustry,
    priceFilter,
    dateFilter,
  ]);

  /**
   * Badges
   */
  const badges = useMemo<FilterBadge[]>(() => {
    const list: FilterBadge[] = [];

    if (searchQuery) {
      list.push({
        key: "search",
        label: `"${searchQuery}"`,
      });
    }

    if (selectedCategory !== "all") {
      list.push({
        key: "category",
        label:
          categories.find((c) => c.slug === selectedCategory)?.name ??
          selectedCategory,
      });
    }

    if (selectedIndustry !== "all") {
      list.push({
        key: "industry",
        label:
          industries.find((i) => i.slug === selectedIndustry)?.name ??
          selectedIndustry,
      });
    }

    if (priceFilter !== "all") {
      list.push({
        key: "price",
        label: priceFilter === "free" ? "Free" : "Paid",
      });
    }

    if (dateFilter !== "all") {
      list.push({
        key: "date",
        label:
          dateFilter === "upcoming"
            ? "Upcoming"
            : dateFilter === "ongoing"
              ? "Ongoing"
              : "Past",
      });
    }

    return list;
  }, [
    searchQuery,
    selectedCategory,
    selectedIndustry,
    priceFilter,
    dateFilter,
    categories,
    industries,
  ]);

  /**
   * Remove Badge
   */
  const removeBadge = useCallback(
    (key: string) => {
      switch (key) {
        case "search":
          setSearchQuery("");
          break;

        case "category":
          setSelectedCategory("all");
          break;

        case "industry":
          setSelectedIndustry("all");
          break;

        case "price":
          setPriceFilter("all");
          break;

        case "date":
          setDateFilter("all");
          break;
      }
    },
    [
      setSearchQuery,
      setSelectedCategory,
      setSelectedIndustry,
      setPriceFilter,
      setDateFilter,
    ],
  );

  return (
    <section className="py-8 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Search */}

        <div className="mb-4 flex items-center gap-3">
          <SearchBox value={searchQuery} onChange={setSearchQuery} />

          <button
            type="button"
            onClick={handleOpen}
            className={`
              h-11
              px-4
              rounded-xl
              border
              flex
              items-center
              gap-2
              transition-all

              ${
                activeFilterCount > 0
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white hover:bg-gray-100"
              }
            `}
          >
            <IoFilterSharp />

            {activeFilterCount > 0 && (
              <span
                className="
                  rounded-full
                  bg-white
                  text-neutral-900
                  text-xs
                  font-semibold
                  px-2
                "
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <FilterBadges badges={badges} onRemove={removeBadge} />
      </div>

      {/* Mobile */}

      {open && (
        <div className="mt-5 md:hidden">
          <FilterPanel
            mobile
            categories={categories}
            industries={industries}
            draft={draft}
            setDraft={setDraft}
            pendingCount={pendingCount}
            onApply={handleApply}
            onReset={handleReset}
            onClose={handleClose}
          />
        </div>
      )}

      {/* Desktop */}

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-40 hidden bg-black/40 md:block"
              style={{ pointerEvents: open ? "auto" : "none" }}
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 16,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 16,
              }}
              transition={{
                duration: 0.2,
              }}
              className="fixed inset-0 z-50 hidden items-center justify-center p-4 md:flex"
            >
              <FilterPanel
                categories={categories}
                industries={industries}
                draft={draft}
                setDraft={setDraft}
                pendingCount={pendingCount}
                onApply={handleApply}
                onReset={handleReset}
                onClose={handleClose}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

export default memo(EventsFilter);
