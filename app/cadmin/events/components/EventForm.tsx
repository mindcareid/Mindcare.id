"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import Cropper, { Area } from "react-easy-crop";
import { autoSlug } from "@/lib/utils/autoSlug";
import { getCroppedImage } from "@/lib/cropImage";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

/* ================= TYPES ================= */

type EventFormProps = {
    id?: number;
    defaultValues?: Partial<EventFormFields>;
    companies: { id: number; name: string }[];
    categories: { id: number; name: string }[];
};

type EventFormFields = {
    title: string;
    slug: string;
    description: string;
    location?: string;
    startDate: string;
    endDate: string;
    price: number;
    quota?: number;
    coverImage?: string;
    publicId?: string;
    isPublished: boolean;
    companyId: number;
    categoryId: number;
};

/* ================= COMPONENT ================= */

export default function EventForm({
    id,
    defaultValues,
    companies,
    categories,
}: EventFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    /* ================= FORM STATE ================= */

    const [form, setForm] = useState<EventFormFields>({
        title: "",
        slug: "",
        description: "",
        location: "",
        startDate: "",
        endDate: "",
        price: 0,
        quota: undefined,
        coverImage: "",
        publicId: "",
        isPublished: false,
        companyId: 0,
        categoryId: 0,
    });

    /* ================= CROP STATES ================= */

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] =
        useState<Area | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    function toLocalDateTimeString(date: string | Date): string {
        const d = new Date(date);
        const offset = d.getTimezoneOffset(); // dalam menit
        const local = new Date(d.getTime() - offset * 60 * 1000); // koreksi timezone
        return local.toISOString().slice(0, 16);
    }

    /* ================= SYNC CREATE / EDIT ================= */

    useEffect(() => {
        if (defaultValues) {
            setForm({
                title: defaultValues.title ?? "",
                slug: defaultValues.slug ?? "",
                description: defaultValues.description ?? "",
                location: defaultValues.location ?? "",
                startDate: defaultValues.startDate
                    ? toLocalDateTimeString(defaultValues.startDate)
                    : "",
                endDate: defaultValues.endDate
                    ? toLocalDateTimeString(defaultValues.endDate)
                    : "",
                price: defaultValues.price ?? 0,
                quota: defaultValues.quota ?? undefined,
                coverImage: defaultValues.coverImage ?? "",
                publicId: defaultValues.publicId ?? "",
                isPublished: defaultValues.isPublished ?? false,
                companyId: Number(defaultValues.companyId ?? companies[0]?.id ?? 0),
                categoryId: Number(defaultValues.categoryId ?? categories[0]?.id ?? 0),
            });
            return;
        }

        if (companies.length && categories.length) {
            setForm((prev) => ({
                ...prev,
                companyId: companies[0].id,
                categoryId: categories[0].id,
            }));
        }
    }, [defaultValues, companies, categories]);

    /* ================= HANDLERS ================= */

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : ["price", "quota", "companyId", "categoryId"].includes(name)
                        ? Number(value)
                        : value,
        }));
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setForm((prev) => ({
            ...prev,
            title: value,
            slug: autoSlug({
                value,
                currentSlug: prev.slug,
                isEdit: !!id,
            }),
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
        (_: Area, pixels: Area) => {
            setCroppedAreaPixels(pixels);
        },
        []
    );

    /* ================= UPLOAD CROPPED ================= */

    const handleCropUpload = async () => {
        if (!imageSrc || !croppedAreaPixels || uploadingImage) return;

        setUploadingImage(true);

        try {
            const croppedBlob = await getCroppedImage(
                imageSrc,
                croppedAreaPixels
            );

            const formData = new FormData();
            formData.append("file", croppedBlob);
            formData.append("upload_preset", "events");

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
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
                    coverImage: data.secure_url,
                    publicId: data.public_id,
                }));
            }

            setShowCropper(false);
            setImageSrc(null);
        } finally {
            setUploadingImage(false);
        }
    };


    /* ================= SUBMIT ================= */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch(`/api/cadmin/events${id ? `?id=${id}` : ""}`, {
                method: id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.message || "Failed to submit");
                return;
            }

            router.push("/cadmin/events");
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
            className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow space-y-8"
        >
            <h1 className="text-2xl font-semibold">
                {id ? "Edit Event" : "Create Event"}
            </h1>

            {/* ================= BASIC INFO ================= */}
            <section className="space-y-4">
                <h2 className="font-medium text-lg">Basic Information</h2>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Event Title
                    </label>
                    <input
                        value={form.title}
                        onChange={handleTitleChange}
                        required
                        placeholder="Ex: React Workshop 2026"
                        className="w-full border px-3 py-2 rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Judul utama event yang akan tampil ke publik
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Slug</label>

                    <input
                        name="slug"
                        value={form.slug}
                        readOnly
                        className="w-full border px-3 py-2 rounded bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Dibuat otomatis dan tidak berubah saat edit
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Company
                        </label>
                        <select
                            name="companyId"
                            value={form.companyId}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded"
                        >
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Category
                        </label>
                        <select
                            name="categoryId"
                            value={form.categoryId}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded"
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Location
                    </label>
                    <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Jakarta / Online"
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
            </section>

            {/* ================= SCHEDULE ================= */}
            <section className="space-y-4">
                <h2 className="font-medium text-lg">Schedule</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Start Date
                        </label>
                        <input
                            type="datetime-local"
                            name="startDate"
                            value={form.startDate}
                            onChange={handleChange}
                            required
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            End Date
                        </label>
                        <input
                            type="datetime-local"
                            name="endDate"
                            value={form.endDate}
                            onChange={handleChange}
                            required
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>
                </div>
            </section>

            {/* ================= PRICING ================= */}
            <section className="space-y-4">
                <h2 className="font-medium text-lg">Pricing & Capacity</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Price
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="0 = Free"
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Quota
                        </label>
                        <input
                            type="number"
                            name="quota"
                            value={form.quota ?? ""}
                            onChange={handleChange}
                            placeholder="Kosongkan jika unlimited"
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>
                </div>
            </section>

            {/* ================= CONTENT ================= */}
            <section className="space-y-3">
                <h2 className="font-medium text-lg">Description</h2>
                <ReactQuill
                    value={form.description}
                    onChange={(v) =>
                        setForm((prev) => ({ ...prev, description: v }))
                    }
                />
            </section>

            {/* COVER IMAGE */}
            {/* COVER IMAGE */}
            <div className="space-y-2">
                <label className="block text-sm font-medium mb-1">
                    Cover Image
                </label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={uploadingImage}
                />

                {/* PREVIEW IMAGE (OLD / NEW) */}
                {form.coverImage && (
                    <div className="relative w-[320px]">
                        <Image
                            src={form.coverImage}
                            alt="Event Cover"
                            width={320}
                            height={180}
                            className="mt-2 rounded object-cover border"
                        />

                        <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {id ? "Current Cover" : "New Cover"}
                        </span>
                    </div>
                )}

                <p className="text-xs text-gray-500">
                    Upload gambar baru untuk mengganti cover lama
                </p>
            </div>


            {/* ================= PUBLISH ================= */}
            <section>
                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="isPublished"
                        checked={form.isPublished}
                        onChange={handleChange}
                        className="h-5 w-5"
                    />
                    <span className="font-medium">Publish Event</span>
                </label>
            </section>

            {/* ================= ACTIONS ================= */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
                >
                    {submitting
                        ? "Submitting..."
                        : id
                            ? "Update Event"
                            : "Create Event"}
                </button>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded"
                >
                    Cancel
                </button>
            </div>

            {/* CROP MODAL */}
            {showCropper && imageSrc && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded w-[90vw] max-w-md">
                        <div className="relative w-full h-75">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={16 / 9}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                disabled={uploadingImage}
                                onClick={() => setShowCropper(false)}
                                className="px-4 py-2 rounded border"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={uploadingImage}
                                onClick={handleCropUpload}
                                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                            >
                                {uploadingImage && (
                                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                {uploadingImage ? "Uploading..." : "Crop & Upload"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
