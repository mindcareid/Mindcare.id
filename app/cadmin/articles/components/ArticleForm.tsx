"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import slugify from "slugify";
import CloudinaryUpload from "@/app/components/events/CloudinaryUpload";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

/* ================= TYPES ================= */

type ArticleFormProps = {
  id?: number;
  defaultValues?: Partial<ArticleFormFields>;
};

type ArticleFormFields = {
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  coverPublicId?: string;

  type: "BLOG" | "NEWS";
  category: "CORPORATE" | "EXECUTIVE" | "INSIGHT" | "UPDATE" | "EVENT";

  published: boolean;
  isActive: boolean;
};

/* ================= COMPONENT ================= */

export default function ArticleForm({ id, defaultValues }: ArticleFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<ArticleFormFields>({
    title: "",
    slug: "",
    content: "",
    type: "BLOG",
    category: "CORPORATE",
    published: false,
    isActive: true,
    coverImage: defaultValues?.coverImage,
    coverPublicId: defaultValues?.coverPublicId,
    ...defaultValues,
  });

  /* ================= CROP STATES ================= */

  // const [imageSrc, setImageSrc] = useState<string | null>(null);
  // const [crop, setCrop] = useState({ x: 0, y: 0 });
  // const [zoom, setZoom] = useState(1);
  // const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  // const [showCropper, setShowCropper] = useState(false);

  /* ================= HANDLERS ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      title: value,
      slug: id ? prev.slug : slugify(value, { lower: true }),
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/articles${id ? `?id=${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/cadmin/articles");
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
      className="max-w-4xl mx-auto bg-white p-6 rounded shadow space-y-6"
    >
      <h2 className="text-xl font-semibold">
        {id ? "Edit Article" : "Create Article"}
      </h2>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Article Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleTitleChange}
          required
          placeholder="e.g. Company Annual Update 2025"
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <input type="hidden" name="slug" value={form.slug} />

      {/* Type & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Article Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="BLOG">Blog</option>
            <option value="NEWS">News / Press Release</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="CORPORATE">Corporate</option>
            <option value="EXECUTIVE">Executive</option>
            <option value="INSIGHT">Insight</option>
            <option value="UPDATE">Update</option>
            <option value="EVENT">Event</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Article Content
        </label>
        <ReactQuill
          value={form.content}
          onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
        />
      </div>
      <CloudinaryUpload
        value={form.coverImage || null}
        publicId={form.coverPublicId || null}
        oldPublicId={form.coverPublicId || null}
        uploadPreset="articles"
        folder="articles"
        label="Click here to upload event image"
        aspectRatio="cover"
        onChange={(url, public_id) =>
          setForm((p) => ({ ...p, coverImage: url, coverPublicId: public_id }))
        }
        onRemove={() =>
          setForm((p) => ({ ...p, coverImage: "", coverPublicId: "" }))
        }
      />

      {/* Status */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            checked={form.published}
            onChange={handleChange}
          />
          Published
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />
          Active
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {submitting ? "Saving..." : id ? "Update Article" : "Create Article"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
