"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import slugify from "slugify";
import Cropper, { Area } from "react-easy-crop";
import { getCroppedImage } from "@/lib/cropImage";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

type CompanyFormProps = {
  id?: number;
  defaultValues?: Partial<CompanyFormFields>;
};

type CompanyFormFields = {
  name: string;
  slug: string;
  description: string;
  logo?: string;
  publicId?: string;
  isActive: boolean;
};

export default function CompanyForm({ id, defaultValues }: CompanyFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<CompanyFormFields>({
    name: "",
    slug: "",
    description: "",
    isActive: true,
    logo: defaultValues?.logo,
    publicId: defaultValues?.publicId,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      name: value,
      slug: id ? prev.slug : slugify(value, { lower: true }),
    }));
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
    (_area: Area, pixels: Area) => {
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
    formData.append("upload_preset", "companies");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data: {
      secure_url?: string;
      public_id?: string;
    } = await res.json();

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
        logo: data.secure_url,
        publicId: data.public_id,
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
      const res = await fetch(`/api/cadmin/companies${id ? `?id=${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/cadmin/companies");
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
      className="max-w-4xl mx-auto bg-white p-6 rounded shadow"
    >
      <h2 className="text-xl font-semibold mb-6">
        {id ? "Edit Company" : "Create Company"}
      </h2>

      <div className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleNameChange}
          required
          placeholder="Company Name"
          className="w-full border px-3 py-2 rounded"
        />

        <input type="hidden" name="slug" value={form.slug} />

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <ReactQuill
            value={form.description}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, description: value }))
            }
            theme="snow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Logo</label>
          <input type="file" accept="image/*" onChange={handleImageSelect} />

          {form.logo && (
            <Image
              src={form.logo}
              alt="Company Logo"
              width={120}
              height={120}
              className="mt-2 rounded bg-gray-100 p-2 object-contain"
            />
          )}
        </div>

        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600"
          />
          <span className="ml-2">Active</span>
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
              ? "Update Company"
              : "Create Company"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>

      {/* ================= CROP MODAL ================= */}
      {showCropper && imageSrc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-100">
            <div className="relative w-full h-75 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
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
