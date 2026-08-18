"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Industry = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
};

type Props = {
  initialData: Industry[];
};

export default function IndustriesList({ initialData }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  async function handleUpdate(id: number) {
    if (!editName.trim()) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/cadmin/industries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message ?? "Failed to update industry");
      }
      toast.success("Industry updated");
      setEditingId(null);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update industry",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleToggle(id: number, current: boolean) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/cadmin/industries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message ?? "Failed to update status");
      }
      toast.success(current ? "Industry deactivated" : "Industry activated");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this industry?")) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/cadmin/industries/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message ?? "Failed to delete industry");
      }
      toast.success("Industry deleted");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete industry",
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
      {initialData.map((industry) => {
        const isProcessing = processingId === industry.id;
        return (
          <li
            key={industry.id}
            className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50"
          >
            {editingId === industry.id ? (
              <>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleUpdate(industry.id)
                  }
                  disabled={isProcessing}
                  className="flex-1 border border-blue-400 rounded px-2 py-1 text-sm disabled:opacity-50"
                />
                <button
                  onClick={() => handleUpdate(industry.id)}
                  disabled={isProcessing}
                  className="text-sm text-blue-600 font-medium disabled:opacity-50"
                >
                  {isProcessing ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  disabled={isProcessing}
                  className="text-sm text-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span
                  className={`flex-1 text-sm ${
                    !industry.isActive
                      ? "text-gray-400 line-through"
                      : "text-gray-800"
                  }`}
                >
                  {industry.name}
                </span>
                <button
                  onClick={() => {
                    setEditingId(industry.id);
                    setEditName(industry.name);
                  }}
                  disabled={isProcessing}
                  className="text-xs text-gray-500 hover:text-blue-600 disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggle(industry.id, industry.isActive)}
                  disabled={isProcessing}
                  className={`text-xs font-medium disabled:opacity-50 ${
                    industry.isActive
                      ? "text-orange-500 hover:text-orange-700"
                      : "text-green-500 hover:text-green-700"
                  }`}
                >
                  {isProcessing
                    ? "..."
                    : industry.isActive
                      ? "Nonactive"
                      : "Active"}
                </button>
                <button
                  onClick={() => handleDelete(industry.id)}
                  disabled={isProcessing}
                  className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                >
                  {isProcessing ? "..." : "Delete"}
                </button>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
