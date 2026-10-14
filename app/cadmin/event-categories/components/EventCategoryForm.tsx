"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/app/components/reusable/Button";
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

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

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
        },
      );

      if (res.ok) {
        toast.success(id ? "Category updated" : "Category created");
        router.push("/cadmin/event-categories");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Failed to submit");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
    >
      <h2 className="mb-6 font-heading text-xl font-semibold text-foreground">
        {id ? "Edit Event Category" : "Create Event Category"}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Category Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleNameChange}
            required
            placeholder="Ex: Workshop, Conference"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Slug
          </label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleSlugChange}
            required
            className={`${inputClass} font-mono text-xs`}
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Active
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="submit" isLoading={submitting}>
          {id ? "Update Category" : "Create Category"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
