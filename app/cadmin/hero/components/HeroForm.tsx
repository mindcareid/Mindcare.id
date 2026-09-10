"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type HeroFormProps = {
  id?: number;
  defaultValues?: Partial<HeroFormFields>;
};

type HeroFormFields = {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  publicId?: string;
  buttonText?: string;
  buttonUrl?: string;
  alignText?: string;
  order: number;
  isActive: boolean;
};

export default function HeroForm({ id, defaultValues }: HeroFormProps) {
  const [form, setForm] = useState<HeroFormFields>({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    publicId: "",
    buttonText: "",
    buttonUrl: "",
    alignText: "center",
    order: 0,
    isActive: true,
    ...defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      setForm((prev) => ({ ...prev, ...defaultValues }));
    }
  }, [defaultValues]);

  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (e.target instanceof HTMLInputElement) {
      const { name, value, type, checked } = e.target;
  
      if (type === "checkbox") {
        setForm((prev) => ({ ...prev, [name]: checked }));
      } else if (type === "number") {
        setForm((prev) => ({ ...prev, [name]: Number(value) }));
      } else {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
  
    } else {
      // Select atau TextArea
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "heroslider"); // preset untuk hero slider

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.secure_url) {
        setForm((prev) => ({
          ...prev,
          image: data.secure_url,
          publicId: data.public_id,
        }));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Image upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/hero${id ? `?id=${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/cadmin/hero");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit");
      }
    } catch (error) {
      console.error("Submit error:", error);
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
        {id ? "Edit Hero Slider" : "Create Hero Slider"}
      </h2>

      <div className="space-y-4">
        <input
          name="title"
          value={form.title || ""}
          onChange={handleChange}
          placeholder="Title"
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          name="subtitle"
          value={form.subtitle || ""}
          onChange={handleChange}
          placeholder="Subtitle"
          className="w-full border px-3 py-2 rounded"
        />

        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          name="buttonText"
          value={form.buttonText || ""}
          onChange={handleChange}
          placeholder="Button Text"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          name="buttonUrl"
          value={form.buttonUrl || ""}
          onChange={handleChange}
          placeholder="Button URL"
          className="w-full border px-3 py-2 rounded"
        />

        <select
          name="alignText"
          value={form.alignText || "center"}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>

        <input
          type="number"
          name="order"
          value={form.order}
          onChange={handleChange}
          placeholder="Order"
          className="w-full border px-3 py-2 rounded"
        />

        <div>
          <label className="block text-sm font-medium">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1 block w-full text-sm"
          />
          {form.image && (
            <div className="mt-2">
              <Image
                src={form.image}
                alt="Preview"
                width={200}
                height={120}
                className="rounded object-cover"
              />
            </div>
          )}
        </div>

        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2">Active</span>
        </label>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {submitting
            ? "Submitting..."
            : id
            ? "Update Hero"
            : "Create Hero"}
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
