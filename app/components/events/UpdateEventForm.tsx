"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UpdateEventSchema, UpdateEventFormData } from "@/lib/validations/auth";
import { CompanyRole } from "@prisma/client";
import QuillEditor from "../ui/QuilEditor";
import { toast } from "sonner";
import CloudinaryUpload from "./CloudinaryUpload";
import { Check } from "lucide-react";
import { z } from "zod";
import { TimeZoneSelect } from "@/app/components/TimeZoneSelect";
import { fromUtcFormat, toUtc } from "@/lib/date";

type Industry = {
  id: number;
  name: string;
};

type EventData = {
  id: number;
  title: string;
  description: string;
  location: string | null;
  startDate: string;
  endDate: string;
  timeZone: string;
  coverImage: string | null;
  publicId: string | null;
  price: number;
  quota: number | null;
  externalUrl: string | null;
  categoryId: number;
  isPublished: boolean;
};

type Props = {
  companyId: string;
  event: EventData;
  role: CompanyRole;
  categories: { id: number; name: string }[];
  industries: Industry[];
  initialIndustryIds: number[];
};

type FieldErrors = Partial<Record<keyof UpdateEventFormData | "form", string>>;

const ROLE_META: Record<
  CompanyRole,
  { label: string; color: string; hint?: string }
> = {
  OWNER: {
    label: "Owner",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  ADMIN: { label: "Admin", color: "bg-blue-100 text-blue-700 border-blue-200" },
  TRAINER: {
    label: "Trainer",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    hint: "You can only update the event description.",
  },
  FINANCE: {
    label: "Finance",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    hint: "You can only update the event price.",
  },
};

export default function EditEventForm({
  companyId,
  event,
  role,
  categories,
  industries,
  initialIndustryIds,
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [oldPublicId, setOldPublicId] = useState<string | null>(
    event.publicId || null,
  );
  const [selectedIndustries, setSelectedIndustries] =
    useState<number[]>(initialIndustryIds);
  const [isPublished, setIsPublished] = useState(event.isPublished);
  const [isPublishing, setIsPublishing] = useState(false);
  const canAll = role === "OWNER" || role === "ADMIN";
  const canDesc = canAll || role === "TRAINER";
  const canPrice = canAll || role === "FINANCE";


  const [form, setForm] = useState({
    title: event.title,
    description: event.description,
    location: event.location ?? "",
    coverImage: event.coverImage,
    publicId: event.publicId,
    startDate: fromUtcFormat(event.startDate, event.timeZone),
    endDate: fromUtcFormat(event.endDate, event.timeZone),
    timeZone: event.timeZone,
    price: event.price.toString(),
    isLimited: event.quota !== null,
    quota: event.quota?.toString() ?? "",
    externalUrl: event.externalUrl ?? "",
    isExternal: event.externalUrl !== null,
    categoryId: event.categoryId.toString(),
    isFree: event.price === 0,
  });

  console.log(form.timeZone);

  function toggleIndustry(id: number) {
    setSelectedIndustries((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch(
        `/api/company/${companyId}/events/${event.id}/publish`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: !isPublished }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update publish status.");
        return;
      }

      setIsPublished(data.data.isPublished);
      toast.success(
        data.data.isPublished
          ? "Event published successfully!"
          : "Event saved as draft.",
      );
    } catch {
      toast.error("Something Wrong!");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (!canAll && !["description", "price"].includes(name)) return;
    if (name === "quota" && value !== "" && Number(value) < 1) return;    setForm((p) => ({ ...p, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((p) => ({ ...p, [name]: undefined }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    if (!canDesc) return;
    setForm((p) => ({ ...p, description: value }));
    if (fieldErrors.description) {
      setFieldErrors((p) => ({ ...p, description: undefined }));
    }
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (canAll && form.isExternal && !form.externalUrl.trim()) {
      setFieldErrors({ externalUrl: "Registration link is required" });
      return;
    }

    const payload: Partial<UpdateEventFormData> = {};
    if (canAll) {
      payload.title = form.title;
      payload.location = form.location || null;
      payload.startDate = toUtc(form.startDate, form.timeZone).toISOString(); // ⬅️ CHANGED
      payload.endDate = toUtc(form.endDate, form.timeZone).toISOString(); // ⬅️ CHANGED
      payload.timeZone = form.timeZone;
      payload.externalUrl = form.isExternal
        ? form.externalUrl.trim() || null
        : null;
      payload.quota =
        form.isExternal || !form.isLimited ? null : Number(form.quota);
      payload.categoryId = Number(form.categoryId);
      payload.coverImage = form.coverImage || null;
      payload.publicId = form.publicId || null;
      payload.industryIds = selectedIndustries;
    }
    if (canDesc) payload.description = form.description;
    if (canPrice)
      payload.price = form.isFree
        ? 0
        : form.price === ""
          ? 0
          : Number(form.price);

    const parsed = UpdateEventSchema.safeParse(payload);
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
      const res = await fetch(`/api/company/${companyId}/events/${event.id}`, {
        method: "PATCH",
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
          toast.error(data.message || "Failed Update Data Event!");
        }
        return;
      }
      toast.success("success Update Event");
      router.push("/company/list-event");
      setTimeout(() => router.refresh(), 500);
    } catch (err) {
      console.log(err);
      toast.error("something wrong, please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const meta = ROLE_META[role];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div
        className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 ${meta.color}`}
      >
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${meta.color}`}
        >
          {meta.label}
        </span>
        {meta.hint && <span className="text-sm">{meta.hint}</span>}
      </div>

      {fieldErrors.form && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {fieldErrors.form}
        </div>
      )}

      <Field label="Title" disabled={!canAll} error={fieldErrors.title}>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          disabled={!canAll}
          className={inputClass(!canAll, !!fieldErrors.title)}
        />
      </Field>

      <Field label="Category" disabled={!canAll} error={fieldErrors.categoryId}>
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          disabled={!canAll}
          className={inputClass(!canAll, !!fieldErrors.categoryId)}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Image Event">
        <CloudinaryUpload
          value={form.coverImage || null}
          publicId={form.publicId || null}
          oldPublicId={oldPublicId}
          uploadPreset="events"
          folder="events"
          label="Upload cover event"
          aspectRatio="cover"
          onChange={(url, pubId) => {
            setOldPublicId(form.publicId || null);
            setForm((p) => ({ ...p, coverImage: url, publicId: pubId }));
          }}
          onRemove={() => {
            setOldPublicId(null);
            setForm((p) => ({ ...p, coverImage: "", publicId: "" }));
          }}
          disabled={!canAll}
        />
      </Field>

      <Field
        label="Description"
        disabled={!canDesc}
        error={fieldErrors.description}
      >
        <QuillEditor
          value={form.description}
          onChange={handleDescriptionChange}
          disabled={!canDesc}
          hasError={!!fieldErrors.description}
        />
      </Field>

      <Field label="Location" disabled={!canAll} error={fieldErrors.location}>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          disabled={!canAll}
          className={inputClass(!canAll, !!fieldErrors.location)}
        />
      </Field>

      <Field label="Time zone" disabled={!canAll} error={fieldErrors.timeZone}>
        <TimeZoneSelect
          value={form.timeZone ?? "Asia/Jakarta"}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              timeZone: value,
            }))
          }
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Start Date"
          disabled={!canAll}
          error={fieldErrors.startDate}
        >
          <input
            type="datetime-local"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            disabled={!canAll}
            className={inputClass(!canAll, !!fieldErrors.startDate)}
          />
        </Field>
        <Field label="End Date" disabled={!canAll} error={fieldErrors.endDate}>
          <input
            type="datetime-local"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            disabled={!canAll}
            className={inputClass(!canAll, !!fieldErrors.endDate)}
          />
        </Field>
      </div>

      <div className="space-y-3">
        <label
          className={`block text-sm font-medium ${!canPrice ? "text-gray-400" : "text-gray-700"}`}
        >
          Price
          {!canPrice && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-400 rounded px-1.5 py-0.5 font-normal">
              Cannot be changed
            </span>
          )}
        </label>
        <div
          className={`flex flex-col md:flex-row rounded-lg border overflow-hidden ${!canPrice ? "border-gray-200 opacity-50" : "border-gray-300"}`}
        >
          {["Free", "Paid"].map((label) => {
            const isFreeOpt = label === "Free";
            return (
              <button
                key={label}
                type="button"
                disabled={!canPrice}
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    isFree: isFreeOpt,
                    price: isFreeOpt ? "" : p.price,
                  }))
                }
                className={`flex-1 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
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
              <span
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium ${!canPrice ? "text-gray-400" : "text-gray-500"}`}
              >
                Rp
              </span>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                disabled={!canPrice}
                min={0}
                className={`${inputClass(!canPrice, !!fieldErrors.price)} pl-10`}
              />
            </div>
          </Field>
        )}
      </div>

      <div className="space-y-3">
        {/* <label
          className={`block text-sm font-medium ${!canAll ? "text-gray-400" : "text-gray-700"}`}
        >
          Maximum Participants
          {!canAll && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-400 rounded px-1.5 py-0.5 font-normal">
              Cannot be changed
            </span>
          )}
        </label> */}

        {/* Toggle Unlimited / Limited */}
        {/* <div
          className={`flex rounded-lg border overflow-hidden ${
            !canAll ? "border-gray-200 opacity-50" : "border-gray-300"
          }`}
        >
          {["Unlimited", "Limited"].map((opt) => {
            const isUnlimitedOpt = opt === "Unlimited";
            return (
              <button
                key={opt}
                type="button"
                disabled={!canAll}
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    isLimited: !isUnlimitedOpt,
                    quota: isUnlimitedOpt ? "" : p.quota,
                  }))
                }
                className={`flex-1 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                  form.isLimited !== isUnlimitedOpt
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div> */}
        {/* {form.isLimited && (
          <Field error={fieldErrors.quota}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canAll || Number(form.quota) <= 1}
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    quota: String(Math.max(1, Number(p.quota) - 1)),
                  }))
                }
                className="h-10 w-10 rounded-lg border border-gray-300 text-gray-600 text-lg font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0"
              >
                −
              </button>
              <input
                type="number"
                name="quota"
                value={form.quota}
                onChange={handleChange}
                disabled={!canAll}
                min={1}
                placeholder="100"
                className={`${inputClass(!canAll, !!fieldErrors.quota)} text-center`}
              />
              <button
                type="button"
                disabled={!canAll}
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    quota: String(Number(p.quota || 0) + 1),
                  }))
                }
                className="h-10 w-10 rounded-lg border border-gray-300 text-gray-600 text-lg font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0"
              >
                +
              </button>
            </div>
          </Field>
        )} */}
      </div>
      {canAll && (
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

          {form.isExternal && event.externalUrl === null && (
            <p className="text-xs text-amber-600">
              Anyone already registered keeps their ticket and stays valid —
              only new sign-ups are sent to your site. If this event has active
              paid orders, saving will be blocked until they are settled or
              refunded.
            </p>
          )}
        </div>
      )}

      <div
        className={`space-y-2 ${!canAll ? "opacity-50 pointer-events-none" : ""}`}
      >
        <Field label=" Industries" required error={fieldErrors.industryIds}>          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
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
      </div>
      {canAll && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Status Event</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isPublished ? "Event is published" : "Event is in draft"}
            </p>
          </div>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
              isPublished ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPublished ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      )}

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
            "Saved Changes"
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
  disabled,
  required,
  hint,
  error,
  children,
}: {
  label?: string;
  disabled?: boolean;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          className={`block text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700"}`}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
          {hint && (
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              ({hint})
            </span>
          )}
          {disabled && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-400 rounded px-1.5 py-0.5 font-normal">
              Cannot be changed
            </span>
          )}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
