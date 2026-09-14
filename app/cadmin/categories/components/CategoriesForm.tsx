"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

type CategoriesFormProps = {
  id?: number;
  defaultValues?: Partial<CategoriesFormFields>;
};

type CategoriesFormFields = {
  slug: string;
  title: string;
  content: string;
  photo?: string;
  publicId?: string;
  isActive: boolean;
  image?: {
    secure_url: string;
    public_id: string;
  };
};

export default function CategoriesForm({ id, defaultValues }: CategoriesFormProps) {
  const [form, setForm] = useState<CategoriesFormFields>({
    slug: "",
    title: "",
    content: "",
    isActive: true,
    photo: defaultValues?.photo,
    publicId: defaultValues?.publicId,
    ...defaultValues,
  });

  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;

    if (type === "checkbox" && target instanceof HTMLInputElement) {
      setForm((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files?.[0];
    if (!files) return;

    const formData2: FormData = new FormData();
    formData2.append("file", files);
    formData2.append("upload_preset", "categories");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dc87bbdnl/auto/upload",
      {
        method: "POST",
        body: formData2,
      }
    );

    const data = await res.json();

    if (data.secure_url && data.public_id) {

      // 🔥 DELETE OLD IMAGE
      if (form.publicId) {
        await fetch("/api/cloudinary/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: form.publicId }),
        });
      }

      setForm((prev) => ({
        ...prev,
        photo: data.secure_url,
        publicId: data.public_id,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/categories${id ? `?id=${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/cadmin/categories");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to submit");
      }
    } catch {
      //console.error(error);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white p-6 rounded shadow"
    >
      <h2 className="text-xl font-semibold mb-6">
        {id ? "Edit Categories" : "Create Categories"}
      </h2>

      <div className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          placeholder="Title"
          className="w-full border border-gray-300 px-3 py-2 rounded"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <ReactQuill
            value={form.content}
            onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
            theme="snow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {form.photo && (
            <div className="mt-2">
              <Image
                src={form.photo}
                alt="Preview"
                width={120}
                height={120}
                className="rounded object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Active</span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {submitting ? "Submitting..." : id ? "Update Categories" : "Create Categories"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
