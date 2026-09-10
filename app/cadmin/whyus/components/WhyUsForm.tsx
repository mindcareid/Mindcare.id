"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

type WhyUsFormProps = {
  id?: number | string;
  defaultValues?: Partial<WhyUsFormFields>;
};

type WhyUsFormFields = {
  title: string;
  description: string;
  image?: string;
  publicId?: string;
  hoverImage?: string;
  hoverPublicId?: string;
  isActive: boolean;
  type: "WHY_US" | "SERVICES" | "OTHER"; 
};

export default function WhyUsForm({ id, defaultValues }: WhyUsFormProps) {
  const [form, setForm] = useState<WhyUsFormFields>({
    title: "",
    description: "",
    type: "WHY_US",
    isActive: true,
    image: defaultValues?.image,
    publicId: defaultValues?.publicId,
    hoverImage: defaultValues?.hoverImage,
    hoverPublicId: defaultValues?.hoverPublicId,
    ...defaultValues,
  });

  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (defaultValues) {
      setForm((prev) => ({
        ...prev,
        ...defaultValues,
      }));
    }
  }, [defaultValues]);

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

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    hover = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "psikologon");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();

    if (data.secure_url && data.public_id) {
      setForm((prev) => ({
        ...prev,
        ...(hover
          ? { hoverImage: data.secure_url, hoverPublicId: data.public_id }
          : { image: data.secure_url, publicId: data.public_id }),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/whyus${id ? `?id=${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/cadmin/whyus");
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

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white p-6 rounded shadow"
    >
      <h2 className="text-xl font-semibold mb-6">
        {id ? "Edit Why Us" : "Create Why Us"}
      </h2>

      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          >
            <option value="WHY_US">Why Us</option>
            <option value="SERVICES">Services</option>
            <option value="VISION">Vision</option>
            <option value="MISSION">Mission</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Title"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <ReactQuill
            value={form.description}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, description: value }))
            }
            theme="snow"
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, false)}
            className="mt-1 block w-full text-sm text-gray-500 
              file:mr-4 file:py-2 file:px-4 
              file:rounded-full file:border-0 
              file:text-sm file:font-semibold 
              file:bg-blue-50 file:text-blue-700 
              hover:file:bg-blue-100"
          />
          {form.image && (
            <div className="mt-2">
              <Image
                src={form.image}
                alt="Preview"
                width={120}
                height={120}
                className="rounded object-cover"
              />
            </div>
          )}
        </div>

        {/* Hover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload Hover Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, true)}
            className="mt-1 block w-full text-sm text-gray-500 
              file:mr-4 file:py-2 file:px-4 
              file:rounded-full file:border-0 
              file:text-sm file:font-semibold 
              file:bg-blue-50 file:text-blue-700 
              hover:file:bg-blue-100"
          />
          {form.hoverImage && (
            <div className="mt-2">
              <Image
                src={form.hoverImage}
                alt="Hover Preview"
                width={120}
                height={120}
                className="rounded object-cover"
              />
            </div>
          )}
        </div>

        {/* Active */}
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
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {submitting
            ? "Submitting..."
            : id
            ? "Update Why Us"
            : "Create Why Us"}
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
