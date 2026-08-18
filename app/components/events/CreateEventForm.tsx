"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateEventSchema, CreateEventFormData } from "@/lib/validations/auth";
import QuillEditor from "../ui/QuilEditor";
import { toast } from "sonner";
import CloudinaryUpload from "./CloudinaryUpload";
import { Check } from "lucide-react";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { eventKeys } from "@/lib/events/query-keys";
import { TimeZoneSelect } from "@/app/components/TimeZoneSelect";
import { getDefaultTimeZone } from "@/lib/timezone";
import { toUtc } from "@/lib/date";

type Industry = {
  id: number;
  name: string;
};

type Props = {
  companyId: string;
  categories: { id: number; name: string }[];
  industries: Industry[];
};

type FieldErrors = Partial<Record<keyof CreateEventFormData | "form", string>>;

export default function CreateEventForm({
  companyId,
  categories,
  industries,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [selectedIndustries, setSelectedIndustries] = useState<number[]>([]);

  function toggleIndustry(id: number) {
    setSelectedIndustries((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    coverImage: "",
    publicId: "",
    startDate: "",
    endDate: "",
    timeZone: getDefaultTimeZone(),
    price: "",
    quota: "",
    externalUrl: "",
    isExternal: false,
    categoryId: "",
    isFree: true,
    isPublished: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((p) => ({ ...p, [name]: undefined }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setForm((p) => ({ ...p, description: value }));
    if (fieldErrors.description) {
      setFieldErrors((p) => ({ ...p, description: undefined }));
    }
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (form.isExternal && !form.externalUrl.trim()) {
      setFieldErrors({ externalUrl: "Registration link is required" });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      location: form.location || null,
      startDate: toUtc(form.startDate, form.timeZone).toISOString(),
      endDate: toUtc(form.endDate, form.timeZone).toISOString(),
      timeZone: form.timeZone,
      coverImage: form.coverImage,
      publicId: form.publicId,
      price: form.isFree ? 0 : form.price === "" ? 0 : Number(form.price),
      // Kuota dikelola situs company saat pendaftaran eksternal.
      quota: form.isExternal || form.quota === "" ? null : Number(form.quota),
      externalUrl: form.isExternal ? form.externalUrl.trim() || null : null,
      categoryId: form.categoryId === "" ? 0 : Number(form.categoryId),
      isPublished: form.isPublished,
      industryIds: selectedIndustries,
    };

    const parsed = CreateEventSchema.safeParse(payload);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      const firstErrors: FieldErrors = {};
      for (const key in fieldErrors) {
        const msgs = fieldErrors[key as keyof typeof fieldErrors];
        if (msgs?.[0]) {
          firstErrors[key as keyof FieldErrors] = msgs[0];
        }
      }
      setFieldErrors(firstErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/company/${companyId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors?.fieldErrors) {
          const firstErrors: FieldErrors = {};
          for (const key in data.errors.fieldErrors) {
            const msgs = data.errors.fieldErrors[key];
            if (msgs?.[0]) firstErrors[key as keyof FieldErrors] = msgs[0];
          }
          setFieldErrors(firstErrors);
        } else {
          toast.error("Failed Create Event!");
        }
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: eventKeys.lists(),
      });
      toast.success("Success Create Event");
      router.push("/company/list-event");
      router.refresh();
    } catch {
      toast.error("Error Create Event!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fieldErrors.form && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {fieldErrors.form}
        </div>
      )}

      <Field label="Name Event" required error={fieldErrors.title}>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Example: UI/UX Design Workshop 2025"
          className={inputClass(false, !!fieldErrors.title)}
        />
      </Field>

      <Field label="Category" required error={fieldErrors.categoryId}>
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          className={inputClass(false, !!fieldErrors.categoryId)}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Upload Image Event" required error={fieldErrors.coverImage}>
        <CloudinaryUpload
          value={form.coverImage || null}
          publicId={form.publicId || null}
          uploadPreset="events"
          folder="events"
          label="Click here to upload event image"
          aspectRatio="cover"
          onChange={(url, pubId) =>
            setForm((p) => ({ ...p, coverImage: url, publicId: pubId }))
          }
          onRemove={() =>
            setForm((p) => ({ ...p, coverImage: "", publicId: "" }))
          }
        />
      </Field>

      <Field label="Description" required error={fieldErrors.description}>
        <QuillEditor
          value={form.description}
          onChange={handleDescriptionChange}
          hasError={!!fieldErrors.description}
          placeholder="Describe the event details, materials, speakers, etc..."
        />
      </Field>

      <Field label="Location" required error={fieldErrors.location}>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="e.g. Conference Hall A / Online via Zoom"
          className={inputClass(false, !!fieldErrors.location)}
        />
      </Field>
      <Field label="Time zone" required error={fieldErrors.timeZone}>
        <TimeZoneSelect
          value={form.timeZone}
          onChange={(value: string) =>
            setForm((prev) => ({
              ...prev,
              timeZone: value,
            }))
          }
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Start Date" required error={fieldErrors.startDate}>
          <input
            type="datetime-local"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className={inputClass(false, !!fieldErrors.startDate)}
          />
        </Field>
        <Field label="End Date" required error={fieldErrors.endDate}>
          <input
            type="datetime-local"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className={inputClass(false, !!fieldErrors.endDate)}
          />
        </Field>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <div className="flex flex-col md:flex-row  rounded-lg border border-gray-300 overflow-hidden">
          {["Free", "Paid"].map((label) => {
            const isFreeOpt = label === "Free";
            return (
              <button
                key={label}
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    isFree: isFreeOpt,
                    price: isFreeOpt ? "" : p.price,
                  }))
                }
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  form.isFree === isFreeOpt
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {!form.isFree && (
          <Field error={fieldErrors.price}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                Rp
              </span>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min={0}
                placeholder="0"
                className={`${inputClass(false, !!fieldErrors.price)} pl-10`}
              />
            </div>
          </Field>
        )}
      </div>

      {/* <Field
        label="Maximum Participants"
        hint="Leave empty if unlimited"
        error={fieldErrors.quota}
        required
      >
        <input
          type="number"
          name="quota"
          value={form.quota}
          onChange={handleChange}
          min={1}
          placeholder="e.g. 100"
          className={inputClass(false, !!fieldErrors.quota)}
        />
      </Field> */}

      <div className="rounded-lg border border-gray-200 px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Registration on another site
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {form.isExternal
                ? "Attendees will be sent to your site. No tickets or payments are handled here."
                : "Attendees register and pay through this platform."}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm((p) => ({
                ...p,
                isExternal: !p.isExternal,
                externalUrl: p.isExternal ? "" : p.externalUrl,
              }))
            }
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              form.isExternal ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                form.isExternal ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {form.isExternal && (
          <Field
            label="Registration link"
            required
            hint="Must start with https://"
            error={fieldErrors.externalUrl}
          >
            <input
              type="url"
              name="externalUrl"
              value={form.externalUrl}
              onChange={handleChange}
              placeholder="https://yourcompany.com/register"
              className={inputClass(false, !!fieldErrors.externalUrl)}
            />
          </Field>
        )}
      </div>

      <Field label=" Industries" required error={fieldErrors.industryIds}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
          {industries.map((industry) => {
            const isSelected = selectedIndustries.includes(industry.id);
            return (
              <button
                key={industry.id}
                type="button"
                onClick={() => toggleIndustry(industry.id)}
                className={`flex items-center gap-1 text-left px-1 py-3 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                    : "border-gray-400 bg-white text-neutral-950 hover:border-blue-600 hover:bg-gray-50"
                }`}
              >
                {isSelected && <Check size={14} />}
                {industry.name}
              </button>
            );
          })}
        </div>
        {selectedIndustries.length > 0 && (
          <p className="text-sm font-semibold text-blue-600 mt-2">
            {selectedIndustries.length}{" "}
            {selectedIndustries.length === 1
              ? "industry selected"
              : "industries selected"}
          </p>
        )}
      </Field>

      <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-700">Status Event</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {form.isPublished
              ? "The event will be published immediately."
              : "The event will be saved as a draft."}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setForm((p) => ({ ...p, isPublished: !p.isPublished }))
          }
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            form.isPublished ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              form.isPublished ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Saving...
            </span>
          ) : (
            "Create Event"
          )}
        </button>
      </div>
    </form>
  );
}

function inputClass(disabled: boolean, hasError: boolean) {
  if (disabled)
    return "w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-400 cursor-not-allowed";
  return `w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 text-gray-900 focus:ring-red-400/20"
      : "border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
  }`;
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
          {hint && (
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              ({hint})
            </span>
          )}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
