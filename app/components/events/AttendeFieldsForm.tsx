"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Props,
  Field,
  emptyField,
  FIELD_TYPES,
  FieldType,
} from "./type/TypeAttendee";
import { useRouter } from "next/navigation";

export default function AttendeeFieldsForm({
  companyId,
  eventId,
  initialFields = [],
}: Props) {
  const [fields, setFields] = useState<Field[]>(
    initialFields.length > 0 ? initialFields : [],
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [optionInputs, setOptionInputs] = useState<Record<number, string>>(
    () => {
      const init: Record<number, string> = {};
      initialFields.forEach((f, i) => {
        init[i] = f.options.join(", ");
      });
      return init;
    },
  );
  const addField = () => {
    setFields((prev) => [...prev, emptyField()]);
    setOptionInputs((prev) => ({ ...prev, [fields.length]: "" }));
  };
  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));

    setOptionInputs((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = Number(k);
        if (ki < index) next[ki] = v;
        else if (ki > index) next[ki - 1] = v;
      });
      return next;
    });
  };
  const updateField = (index: number, key: keyof Field, value: unknown) => {
    setFields((prev) =>
      prev.map((field, i) => {
        if (i !== index) return field;
        const updated = { ...field, [key]: value };
        if (key === "label") {
          updated.key = (value as string)
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");
        }
        return updated;
      }),
    );
  };

  const updateOptions = (index: number, value: string) => {
    setOptionInputs((prev) => ({ ...prev, [index]: value }));
  };
  const handleOptionBlur = (index: number) => {
    const options = (optionInputs[index] ?? "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
    updateField(index, "options", options);
  };

  const handleSave = async () => {
    for (const f of fields) {
      if (!f.label.trim()) {
        toast.error("Each field must have a label");
        return;
      }
      if (!f.key.trim()) {
        toast.error("Each field must have a key");
        return;
      }
      if (f.type === "SELECT" && f.options.length === 0) {
        toast.error(`Field "${f.label}" must have at least one option`);
        return;
      }
    }

    const keys = fields.map((f) => f.key);
    const hasDuplicate = keys.some((k, i) => keys.indexOf(k) !== i);
    if (hasDuplicate) {
      toast.error("Key must be unique");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/company/${companyId}/events/${eventId}/attendee-fields`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            fields.map((field, i) => ({ ...field, order: i })),
          ),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed saved Data");
        return;
      }
      toast.success("Attendee Successfully saved!");
      router.push("/company/list-event");
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
        <span>
          Default fields: <strong>Full Name</strong>, <strong>Email</strong>,{" "}
          <strong>Phone Number</strong>. Add additional fields below.
        </span>
      </div>

      {fields.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 py-8 text-center text-sm text-gray-400">
          No additional fields yet. Add one using the button below.
        </div>
      )}

      {fields.map((field, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Field {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeField(index)}
              className="text-xs text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(index, "label", e.target.value)}
                placeholder="Contoh: Nama Perusahaan"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={field.key}
                onChange={(e) => updateField(index, "key", e.target.value)}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-not-allowed"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Type
              </label>
              <select
                value={field.type}
                onChange={(e) =>
                  updateField(index, "type", e.target.value as FieldType)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <button
                type="button"
                onClick={() => updateField(index, "required", !field.required)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                  field.required ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    field.required ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {field.required ? "Required" : "Optional"}
              </span>
            </div>
          </div>

          {field.type === "SELECT" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Options{" "}
                <span className="text-gray-400">(separate by commas)</span>
              </label>
              <input
                type="text"
                value={optionInputs[index] ?? ""}
                onChange={(e) => updateOptions(index, e.target.value)}
                onBlur={() => handleOptionBlur(index)}
                placeholder="Student, College Student, Professional"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Preview options */}
              {field.options.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {field.options.map((opt, i) => (
                    <span
                      key={i}
                      className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-200"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={addField}
          className="flex-1 rounded-lg border border-dashed border-blue-400 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
        >
          + Add Field
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          <button>{loading ? "Saving..." : "Save Fields"}</button>
        </button>
      </div>
    </div>
  );
}
