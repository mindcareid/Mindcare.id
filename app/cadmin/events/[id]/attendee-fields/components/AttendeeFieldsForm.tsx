"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type FieldType =
  | "TEXT"
  | "EMAIL"
  | "PHONE"
  | "NUMBER"
  | "DATE"
  | "SELECT";

type AttendeeFieldFormProps = {
  eventId: number; // 🔥 WAJIB number
  fieldId?: string;
  defaultValues?: {
    label: string;
    type: FieldType;
    required: boolean;
    options?: string[];
  };
};

type SubmitPayload = {
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
};

/* ================= COMPONENT ================= */

export default function AttendeeFieldForm({
  eventId,
  fieldId,
  defaultValues,
}: AttendeeFieldFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    label: defaultValues?.label ?? "",
    type: defaultValues?.type ?? "TEXT",
    required: defaultValues?.required ?? false,
    options: defaultValues?.options?.join("\n") ?? "",
  });

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventId || Number.isNaN(eventId)) {
      alert("Invalid eventId (form)");
      return;
    }

    setSubmitting(true);

    const payload: SubmitPayload = {
      label: form.label.trim(),
      type: form.type,
      required: form.required,
    };

    if (form.type === "SELECT") {
      const parsedOptions = form.options
        .split("\n")
        .map((o) => o.trim())
        .filter(Boolean);

      if (parsedOptions.length === 0) {
        alert("Options are required for SELECT type");
        setSubmitting(false);
        return;
      }

      payload.options = parsedOptions;
    }

    console.log(fieldId);

    const res = await fetch(
      `/api/cadmin/events/${eventId}/attendee-fields${
        fieldId ? `/${fieldId}` : ""
      }`,
      {
        method: fieldId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    setSubmitting(false);

    if (!res.ok) {
      const err = await res.json();
      alert(err?.message || "Failed to save attendee field");
      return;
    }

    router.push(`/cadmin/events/${eventId}/attendee-fields`);
  };

  /* ================= UI ================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl bg-white p-6 rounded-lg shadow space-y-6"
    >
      <h1 className="text-2xl font-semibold">
        {fieldId ? "Edit Attendee Field" : "Create Attendee Field"}
      </h1>

      {/* LABEL */}
      <div>
        <label className="block text-sm font-medium mb-1">Label</label>
        <input
          value={form.label}
          onChange={(e) =>
            setForm((p) => ({ ...p, label: e.target.value }))
          }
          required
          className="w-full border px-3 py-2 rounded"
          placeholder="Ex: Full Name"
        />
      </div>

      {/* TYPE */}
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          value={form.type}
          onChange={(e) =>
            setForm((p) => ({ ...p, type: e.target.value as FieldType }))
          }
          className="w-full border px-3 py-2 rounded"
        >
          <option value="TEXT">Text</option>
          <option value="EMAIL">Email</option>
          <option value="PHONE">Phone</option>
          <option value="NUMBER">Number</option>
          <option value="DATE">Date</option>
          <option value="SELECT">Select</option>
        </select>
      </div>

      {/* OPTIONS */}
      {form.type === "SELECT" && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Options (one per line)
          </label>
          <textarea
            value={form.options}
            onChange={(e) =>
              setForm((p) => ({ ...p, options: e.target.value }))
            }
            rows={4}
            className="w-full border px-3 py-2 rounded"
            placeholder="Option 1\nOption 2"
          />
        </div>
      )}

      {/* REQUIRED */}
      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.required}
          onChange={(e) =>
            setForm((p) => ({ ...p, required: e.target.checked }))
          }
          className="h-5 w-5"
        />
        <span className="font-medium">Required</span>
      </label>

      {/* ACTION */}
      <div className="flex gap-3">
        <button
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
        >
          {submitting ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="border px-5 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}