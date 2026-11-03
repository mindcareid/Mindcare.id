"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Replace, Trash2, UploadCloud } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";

export type FileValue = {
  url: string | null;
  publicId: string | null;
};

type PdfUploadFieldProps = {
  label: string;
  hint?: string;
  value: FileValue;
  onChange: (next: FileValue) => void;
  disabled?: boolean;
  deferDelete?: boolean;
  onDiscard?: (publicIds: string[]) => void;
};

const MAX_SIZE_MB = 15;
export default function PdfUploadField({
  label,
  hint,
  value,
  onChange,
  disabled = false,
  deferDelete = false,
  onDiscard,
}: PdfUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function openPicker() {
    if (disabled || busy) return;
    setMessage(null);
    inputRef.current?.click();
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setMessage("Only PDF files are supported.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setMessage(`File is larger than ${MAX_SIZE_MB} MB.`);
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const uploaded = await uploadToCloudinary(
        file,
        "event-proposals",
        deferDelete ? undefined : value.publicId,
      );

      if (
        deferDelete &&
        value.publicId &&
        value.publicId !== uploaded.public_id
      ) {
        onDiscard?.([value.publicId]);
      }

      onChange({ url: uploaded.secure_url, publicId: uploaded.public_id });
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    setMessage(null);

    try {
      if (value.publicId) {
        if (deferDelete) {
          onDiscard?.([value.publicId]);
        } else {
          await fetch("/api/cloudinary/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId: value.publicId }),
          }).catch(() => undefined);
        }
      }
    } finally {
      onChange({ url: null, publicId: null });
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-foreground">{label}</span>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFile}
      />

      {value.url ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
          <FileText className="h-8 w-8 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              Proposal PDF
            </p>
            <a
              href={value.url}
              target="_blank"
              rel="noreferrer noopener"
              className="truncate text-xs text-secondary underline"
            >
              Open file
            </a>
          </div>
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled || busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            <Replace className="h-4 w-4" />
            Replace
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || busy}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || busy}
          className="flex w-full max-w-sm flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-8 text-center transition-colors hover:bg-muted disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {busy ? "Uploading…" : "Click to choose a PDF"}
          </span>
        </button>
      )}

      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {message ? <p className="text-xs text-destructive">{message}</p> : null}
    </div>
  );
}
