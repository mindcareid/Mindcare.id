"use client";

import { useState } from "react";
import { FiDownload, FiLoader } from "react-icons/fi";
import { toast } from "sonner";

type Props = {
  eventId: number;
  status?: string;
};

export default function ExportParticipantsButton({ eventId, status }: Props) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    try {
      const url = new URL(
        `/api/company/participant-reports/${eventId}/export`,
        window.location.origin,
      );

      if (status) url.searchParams.set("status", status);

      const res = await fetch(url.toString());

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed Export Data");
      }
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const disposition = res.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] ?? "Participant.xlsx";

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed Export Data Participant",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <FiLoader className="w-4 h-4 animate-spin" />
      ) : (
        <FiDownload className="w-4 h-4" />
      )}
      {loading ? "Exporting..." : "Export to Excel"}
    </button>
  );
}
