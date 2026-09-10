"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CategoriesForm from "@/app/cadmin/categories/components/CategoriesForm";

type CategoriesData = {
  id: number;
  slug: string;
  title: string;
  publicId: string;
  photo?: string;
  content?: string;
  isActive: boolean;
};

export default function EditCategoriesPage() {
  const { id } = useParams();
  const [categoriesData, setCategoriesData] = useState<CategoriesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/categories?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        const categories = data.data;

        if (categories && typeof categories === "object") {
          setCategoriesData(categories);
        } else {
          setCategoriesData(null);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!categoriesData) return <p>Categories not found</p>;

  return (
    <div className="p-4">
      <CategoriesForm
        id={parseInt(id as string)}
        defaultValues={{
          ...categoriesData,
          image: categoriesData.photo
            ? {
                secure_url: categoriesData.photo,
                public_id: categoriesData.publicId ?? "",
              }
            : undefined,
        }}
      />
    </div>
  );
}
