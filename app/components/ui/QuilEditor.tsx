"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  placeholder?: string;
};

export default function QuillEditor({
  value,
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "Describe the event...",
}: Props) {
  const modules = useMemo(
    () => ({
      toolbar: disabled
        ? false
        : [
            [{ header: [2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
    }),
    [disabled],
  );

  return (
    <div
      className={`quill-wrapper rounded-lg border transition-colors ${
        disabled
          ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
          : hasError
            ? "border-red-400 focus-within:ring-2 focus-within:ring-red-400/20"
            : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
      }`}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        readOnly={disabled}
        placeholder={placeholder}
        modules={modules}
        className="text-sm"
      />
    </div>
  );
}
