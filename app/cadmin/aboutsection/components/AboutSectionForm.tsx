"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cropper, { Area } from "react-easy-crop";
import { getCroppedImage } from "@/lib/cropImage";

/* ================= TYPES ================= */

type AboutSectionFormProps = {
  id?: number;
  defaultValues?: Partial<AboutSectionFormFields>;
};

type AboutSectionFormFields = {
  title: string;
  description: string;
  imageUrl?: string;
  imagePublicId?: string;

  orderIndex: number;
  imagePosition: "left" | "right";
  isActive: boolean;
};

/* ================= COMPONENT ================= */

export default function AboutSectionForm({
  id,
  defaultValues,
}: AboutSectionFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<AboutSectionFormFields>({
    title: "",
    description: "",
    orderIndex: 0,
    imagePosition: "left",
    isActive: true,
    imageUrl: defaultValues?.imageUrl,
    imagePublicId: defaultValues?.imagePublicId,
    ...defaultValues,
  });

  /* ================= CROP STATES ================= */

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Area | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  /* ================= HANDLERS ================= */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === "number") {
      setForm((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /* ================= IMAGE PICK ================= */

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback(
    (_: Area, pixels: Area) => {
      setCroppedAreaPixels(pixels);
    },
    []
  );

  /* ================= UPLOAD CROPPED ================= */

  const handleCropUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const croppedBlob = await getCroppedImage(
      imageSrc,
      croppedAreaPixels
    );

    const formData = new FormData();
    formData.append("file", croppedBlob);
    formData.append("upload_preset", "about-sections");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data: { secure_url?: string; public_id?: string } =
      await res.json();

    if (data.secure_url && data.public_id) {
      if (form.imagePublicId) {
        await fetch("/api/cloudinary/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: form.imagePublicId }),
        });
      }

      setForm((prev) => ({
        ...prev,
        imageUrl: data.secure_url,
        imagePublicId: data.public_id,
      }));
    }

    setShowCropper(false);
    setImageSrc(null);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(
        `/api/about-section${id ? `?id=${id}` : ""}`,
        {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (res.ok) {
        router.push("/cadmin/aboutsection");
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
        {id ? "Edit About Section" : "Create About Section"}
      </h2>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={5}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
        />

        {form.imageUrl && (
          <Image
            src={form.imageUrl}
            alt="About"
            width={240}
            height={160}
            className="mt-3 rounded border object-cover"
          />
        )}
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Image Position
          </label>
          <select
            name="imagePosition"
            value={form.imagePosition}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Order Index
          </label>
          <input
            type="number"
            name="orderIndex"
            value={form.orderIndex}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      </div>

      {/* Status */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
        />
        Active
      </label>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {submitting
            ? "Saving..."
            : id
            ? "Update Section"
            : "Create Section"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>

      {/* ================= CROP MODAL ================= */}

      {showCropper && imageSrc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[90vw] max-w-xl">
            <div className="relative h-72 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowCropper(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}