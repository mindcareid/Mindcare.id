import { Suspense } from "react";
import CategoriesSubClient from "./CategoriesSubClient";

export default function CategoriesSubPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CategoriesSubClient />
    </Suspense>
  );
}