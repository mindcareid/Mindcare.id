"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import Button from "@/app/components/reusable/Button";
import Container from "@/app/components/reusable/Container";
import PageHero from "@/app/components/reusable/PageHero";
import SearchBar from "@/app/components/reusable/SearchBar";
import SortSelect, {
  type SortOption,
} from "@/app/components/reusable/SortSelect";
import ProfessionalsFilter, {
  countActiveFilters,
  emptyFilterState,
  type FilterGroup,
  type ProfessionalFilterState,
} from "./section/ProfessionalsFilter";
import ProfessionalsGrid from "./section/ProfessionalsGrid";
import type {
  Professional,
  ProfessionalFacets,
  ProfessionalSort,
} from "./type/professional";

const sortOptions: SortOption[] = [
  { value: "relevance", label: "Relevance" },
  { value: "experience", label: "Most experienced" },
  { value: "price-asc", label: "Lowest price" },
  { value: "name-asc", label: "Name A–Z" },
];

type ProfessionalsProps = {
  professionals: Professional[];
  facets: ProfessionalFacets;
  /**
   * Acuan waktu tunggal dari `page.tsx`, ISO string.
   *
   * Ditambahkan 24 Agustus 2026, pola yang sama dengan `CareCentres.tsx`. Wajib
   * datang dari server: kalau komponen ini memanggil `Date.now()` sendiri, render
   * server dan hidrasi klien bisa berbeda dan React akan mengeluh soal hidrasi —
   * dan yang lebih buruk, kartu di halaman ini bisa berbeda pendapat dengan hero
   * di halaman detail soal orang yang sama.
   */
  now: string;
};

export default function Professionals({
  professionals,
  facets,
  now,
}: ProfessionalsProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] =
    useState<ProfessionalFilterState>(emptyFilterState);
  const [sort, setSort] = useState<ProfessionalSort>("relevance");

  function toggleFilter(group: FilterGroup, option: string) {
    setFilters((current) => {
      const list = current[group];
      return {
        ...current,
        [group]: list.includes(option)
          ? list.filter((item) => item !== option)
          : [...list, option],
      };
    });
  }

  function resetAll() {
    setFilters(emptyFilterState);
    setQuery("");
  }

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    const filtered = professionals.filter((item) => {
      const matchesKeyword =
        keyword === "" ||
        [
          item.fullName,
          item.credentials,
          item.profession,
          item.location.city,
          item.location.province,
          ...item.areasOfSupport.map((area) => area.name),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      const matchesProfession =
        filters.professions.length === 0 ||
        filters.professions.includes(item.profession);

      const matchesArea =
        filters.areas.length === 0 ||
        item.areasOfSupport.some((area) => filters.areas.includes(area.slug));

      const matchesMode =
        filters.sessionModes.length === 0 ||
        item.sessionModes.some((mode) => filters.sessionModes.includes(mode));

      const matchesCity =
        filters.cities.length === 0 ||
        filters.cities.includes(item.location.city);

      return (
        matchesKeyword &&
        matchesProfession &&
        matchesArea &&
        matchesMode &&
        matchesCity
      );
    });

    switch (sort) {
      case "experience":
        return [...filtered].sort(
          (a, b) => b.yearsOfExperience - a.yearsOfExperience,
        );
      case "price-asc":
        return [...filtered].sort(
          (a, b) => a.startingPriceIdr - b.startingPriceIdr,
        );
      case "name-asc":
        return [...filtered].sort((a, b) =>
          a.fullName.localeCompare(b.fullName, "id-ID"),
        );
      default:
        return filtered;
    }
  }, [professionals, query, filters, sort]);

  const activeCount = countActiveFilters(filters);

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Find your support"
        contentClassName="max-w-none"
        title="Talk to a mental-health professional you can trust"
        subtitle="Browse verified psychologists, psychiatrists, and counsellors across Indonesia. Filter by what you need support with, then reach out when you are ready."
      >
        <SearchBar
          value={query}
          onValueChange={setQuery}
          className="max-w-2xl"
        />
      </PageHero>

      <Container className="pb-20 max-w-none">
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <div className="space-y-4">
            <ProfessionalsFilter
              facets={facets}
              value={filters}
              onToggle={toggleFilter}
              onReset={resetAll}
            />
          </div>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {visible.length}
                </span>{" "}
                of {professionals.length} professionals
                {activeCount > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-secondary">
                    <SlidersHorizontal
                      className="size-3.5"
                      aria-hidden="true"
                    />
                    {activeCount} filter{activeCount > 1 ? "s" : ""} active
                  </span>
                )}
              </p>

              <SortSelect
                value={sort}
                onValueChange={(next) => setSort(next as ProfessionalSort)}
                options={sortOptions}
              />
            </div>

            <ProfessionalsGrid
              professionals={visible}
              now={now}
              resetAction={
                <Button variant="outline" onClick={resetAll}>
                  Reset all filters
                </Button>
              }
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
