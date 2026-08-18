"use client";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

type AttendeeValue = string | number | boolean | null;
type AttendeeFormValue = Record<string, AttendeeValue>;

type Props = {
  fields: {
    id: string | number;
    label: string;
    key: string;
    type: "TEXT" | "EMAIL" | "PHONE" | "SELECT" | "TEXTAREA";
    required: boolean;
    options?: string[];
  }[];
  value: AttendeeFormValue;
  errors?: Record<string, string>;
  onChange: (val: AttendeeFormValue) => void;
};

export default function AttendeeDynamicForm({
  fields,
  value,
  errors = {},
  onChange,
}: Props) {
  const updateValue = (key: string, val: AttendeeValue) => {
    onChange({
      ...value,
      [key]: val,
    });
  };

  const inputClass = (key: string) =>
    `w-full border rounded-lg p-2 text-sm transition focus:outline-none focus:ring-2 ${
      errors[key]
        ? "border-red-400 focus:ring-red-300"
        : "border-gray-300 focus:ring-blue-300"
    }`;

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const fieldValue = (value[field.key] ?? "") as string;

        return (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* TEXTAREA */}
            {field.type === "TEXTAREA" && (
              <textarea
                className={inputClass(field.key)}
                required={field.required}
                value={fieldValue}
                onChange={(e) => updateValue(field.key, e.target.value)}
              />
            )}

            {/* SELECT */}
            {field.type === "SELECT" && (
              <select
                className={inputClass(field.key)}
                required={field.required}
                value={fieldValue}
                onChange={(e) => updateValue(field.key, e.target.value)}
              >
                <option value="">Select</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {/* INPUT */}
            {field.type === "PHONE" && (
              <PhoneInput
                international
                defaultCountry="ID"
                value={fieldValue}
                onChange={(val) => updateValue(field.key, val ?? "")}
                className={`phone-input w-full ${
                  errors[field.key] ? "phone-error" : ""
                }`}
              />
            )}

            {field.type !== "TEXTAREA" &&
              field.type !== "SELECT" &&
              field.type !== "PHONE" && (
                <input
                  type={field.type.toLowerCase()}
                  className={inputClass(field.key)}
                  required={field.required}
                  value={fieldValue}
                  onChange={(e) => updateValue(field.key, e.target.value)}
                />
              )}
            {errors[field.key] && (
              <p className="text-xs text-red-500 mt-1">{errors[field.key]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
