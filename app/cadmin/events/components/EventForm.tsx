"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { autoSlug } from "@/lib/utils/autoSlug";
import { toEventPlainText } from "@/lib/events/serializers";
import ImageUploadField from "@/app/components/reusable/ImageUploadField";

/* ================= TYPES ================= */

type EventFormProps = {
    id?: number;
    defaultValues?: Partial<EventFormFields>;
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
    categoryId: number;
};

/* ================= COMPONENT ================= */

export default function EventForm({
    id,
    defaultValues,
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
        categoryId: 0,
    });

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
                description: toEventPlainText(defaultValues.description ?? ""),
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
                categoryId: Number(defaultValues.categoryId ?? categories[0]?.id ?? 0),
            });
            return;
        }

        if (categories.length) {
            setForm((prev) => ({
                ...prev,
                categoryId: categories[0].id,
            }));
        }
    }, [defaultValues, categories]);

    /* ================= HANDLERS ================= */

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : ["price", "quota", "categoryId"].includes(name)
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
                <label
                    htmlFor="event-description"
                    className="block text-sm font-medium mb-1"
                >
                    Description
                </label>
                <textarea
                    id="event-description"
                    name="description"
                    rows={8}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the event. Leave a blank line between paragraphs."
                    className="w-full border px-3 py-2 rounded"
                />
                <p className="text-xs text-gray-500">
                    Plain text. Blank lines separate paragraphs.
                </p>
            </section>

            {/* COVER IMAGE */}
            <ImageUploadField
                label="Cover Image"
                hint="4:3 image (1600x1200 max), WebP, normally under 100 KB."
                entityType="events"
                aspect={4 / 3}
                shape="wide"
                maxWidth={1600}
                maxHeight={1200}
                value={{
                    url: form.coverImage || null,
                    publicId: form.publicId || null,
                }}
                onChange={({ url, publicId }) =>
                    setForm((prev) => ({
                        ...prev,
                        coverImage: url ?? "",
                        publicId: publicId ?? "",
                    }))
                }
            />


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
        </form>
    );
}
