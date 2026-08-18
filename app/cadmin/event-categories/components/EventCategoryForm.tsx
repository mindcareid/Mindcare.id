"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { autoSlug } from "@/lib/utils/autoSlug";


type EventCategoryFormProps = {
  id?: number;
  defaultValues?: Partial<EventCategoryFormFields>;
};

type EventCategoryFormFields = {
  name: string;
  slug: string;
  isActive: boolean;
};

export default function EventCategoryForm({
  id,
  defaultValues,
}: EventCategoryFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);


  const [form, setForm] = useState<EventCategoryFormFields>({
    name: "",
    slug: "",
    isActive: true,
    ...defaultValues,
  });

  /* ================= HANDLERS ================= */

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      name: value,
      slug: autoSlug({
        value,
        currentSlug: prev.slug,
        isEdit: !!id,
        slugTouched,
      }),
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true);

    setForm((prev) => ({
      ...prev,
      slug: autoSlug({
        value: e.target.value,
        currentSlug: prev.slug,
        slugTouched: false, // force generate dari input slug
      }),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, type, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(
        `/api/event-categories${id ? `?id=${id}` : ""}`,
        {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (res.ok) {
        router.push("/cadmin/event-categories");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to submit");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white p-6 rounded shadow"
    >
      <h2 className="text-xl font-semibold mb-6">
        {id ? "Edit Event Category" : "Create Event Category"}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Category Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleNameChange}
            required
            placeholder="Ex: Workshop, Conference"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>

          <input
            name="slug"
            value={form.slug}
            onChange={handleSlugChange}
            required
            className="w-full border px-3 py-2 rounded bg-gray-50"
          />
        </div>



        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600"
          />
          <span>Active</span>
        </label>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {submitting
            ? "Submitting..."
            : id
              ? "Update Category"
              : "Create Category"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
