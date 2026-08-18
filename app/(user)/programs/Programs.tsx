"use client";

import { useState, useMemo } from "react";
import { categories, programs } from "./data/data";
import ProgramsFilter from "./section/ProgramsFilter";
import ProgramsGrid from "./section/ProgramsGrid";

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  // Get subcategories based on selected category
  const availableSubCategories = useMemo(() => {
    if (selectedCategory === "all") return [];
    const category = categories.find((cat) => cat.slug === selectedCategory);
    return category?.subCategories || [];
  }, [selectedCategory]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesSearch =
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesCategory =
        selectedCategory === "all" ||
        program.category ===
          categories.find((c) => c.slug === selectedCategory)?.name;

      const matchesSubCategory =
        selectedSubCategory === "all" ||
        program.subCategory ===
          availableSubCategories.find((sc) => sc.slug === selectedSubCategory)
            ?.name;

      const matchesLevel =
        selectedLevel === "all" || program.level === selectedLevel;

      return (
        matchesSearch && matchesCategory && matchesSubCategory && matchesLevel
      );
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedSubCategory,
    selectedLevel,
    availableSubCategories,
  ]);

  return (
    <main className="min-h-screen">
      <ProgramsFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubCategory={selectedSubCategory}
        setSelectedSubCategory={setSelectedSubCategory}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        availableSubCategories={availableSubCategories}
      />
      <ProgramsGrid
        programs={filteredPrograms}
        totalPrograms={programs.length}
      />
    </main>
  );
}
