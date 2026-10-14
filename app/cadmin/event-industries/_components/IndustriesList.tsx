"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/app/components/reusable/Button";
import { Pencil, Trash2 } from "lucide-react";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { cn } from "@/lib/utils";

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

  if (initialData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-card">
        No industries yet. Add one above.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
      {initialData.map((industry) => {
        const isProcessing = processingId === industry.id;
        const editing = editingId === industry.id;

        return (
          <li
            key={industry.id}
            className="flex flex-col gap-3 p-4 transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
          >
            {editing ? (
              <>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleUpdate(industry.id)
                  }
                  disabled={isProcessing}
                  className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <Button
                  size="sm"
                  isLoading={isProcessing}
                  onClick={() => handleUpdate(industry.id)}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isProcessing}
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-sm",
                      industry.isActive
                        ? "text-foreground"
                        : "text-muted-foreground line-through",
                    )}
                  >
                    {industry.name}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      industry.isActive
                        ? "bg-brand-mint-100 text-accent"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {industry.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(industry.id);
                      setEditName(industry.name);
                    }}
                    disabled={isProcessing}
                    className={buttonStyles({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    {" "}
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle(industry.id, industry.isActive)}
                    disabled={isProcessing}
                    className={buttonStyles({ variant: "ghost", size: "sm" })}
                  >
                    {isProcessing
                      ? "..."
                      : industry.isActive
                        ? "Deactivate"
                        : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(industry.id)}
                    disabled={isProcessing}
                    className={buttonStyles({ variant: "danger", size: "sm" })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
