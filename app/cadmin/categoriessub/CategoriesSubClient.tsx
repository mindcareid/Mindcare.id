"use client";

import { useSearchParams } from "next/navigation";
import CategoriesSubList from "./components/CategoriesSubList";

export default function CategoriesSubClient() {
  const searchParams = useSearchParams();
  const categoriesId = searchParams.get("categoriesId");

  return (
    <div className="p-6">
      <CategoriesSubList
        categoriesId={categoriesId ? Number(categoriesId) : undefined}
      />
    </div>
  );
}