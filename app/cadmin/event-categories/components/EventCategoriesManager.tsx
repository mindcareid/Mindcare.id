"use client";

import { useEffect, useState } from "react";
import slugify from "slugify";
import { toast } from "sonner";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import Button from "@/app/components/reusable/Button";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { cn } from "@/lib/utils";

type EventCategory = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
};

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export default function EventCategoriesManager() {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [editing, setEditing] = useState<
    Record<number, { name: string; slug: string }>
  >({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/event-categories")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setCategories(json.data ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load categories");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    const finalSlug =
      slug.trim() || slugify(name, { lower: true, strict: true });
    setSaving(true);
    try {
      const res = await fetch("/api/event-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: finalSlug }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to create");
      setName("");
      setSlug("");
      toast.success("Category added");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(
    id: number,
    patch: Partial<{ name: string; slug: string; isActive: boolean }>,
  ) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/event-categories?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update");
      toast.success("Category updated");
      setEditing((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(category: EventCategory) {
    if (!confirm(`Delete "${category.name}"?`)) return;
    setProcessingId(category.id);
    try {
      const res = await fetch(`/api/event-categories?id=${category.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to delete");
      toast.success("Category deleted");
      refresh();
    } catch (err) {
      // Kategori yang masih dipakai event tidak bisa dihapus — beri tahu.
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Add a category
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-foreground">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Webinar"
            />
          </label>
          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-foreground">
              Slug
            </span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputClass}
              placeholder="auto from name"
            />
          </label>
          <Button
            type="button"
            icon={Plus}
            disabled={saving}
            onClick={handleCreate}
            className="w-full lg:w-auto"
          >
            Add
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {loading ? (
          <p className="p-5 text-sm text-muted-foreground">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No categories yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((category) => {
              const draft = editing[category.id];
              const isProcessing = processingId === category.id;

              if (draft) {
                return (
                  <li key={category.id} className="space-y-3 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1.5">
                        <span className="block text-xs font-medium text-muted-foreground">
                          Name
                        </span>
                        <input
                          autoFocus
                          value={draft.name}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [category.id]: {
                                name: e.target.value,
                                slug: prev[category.id]?.slug ?? category.slug,
                              },
                            }))
                          }
                          className={inputClass}
                        />
                      </label>
                      <label className="space-y-1.5">
                        <span className="block text-xs font-medium text-muted-foreground">
                          Slug
                        </span>
                        <input
                          value={draft.slug}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [category.id]: {
                                name: prev[category.id]?.name ?? category.name,
                                slug: e.target.value,
                              },
                            }))
                          }
                          className={cn(inputClass, "font-mono text-xs")}
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        icon={Save}
                        isLoading={isProcessing}
                        onClick={() =>
                          handleUpdate(category.id, {
                            name: draft.name,
                            slug: draft.slug,
                          })
                        }
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isProcessing}
                        onClick={() =>
                          setEditing((prev) => {
                            const next = { ...prev };
                            delete next[category.id];
                            return next;
                          })
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={category.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          category.isActive
                            ? "text-foreground"
                            : "text-muted-foreground line-through",
                        )}
                      >
                        {category.name}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        /{category.slug}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium",
                        category.isActive
                          ? "bg-brand-mint-100 text-accent"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        setEditing((prev) => ({
                          ...prev,
                          [category.id]: {
                            name: category.name,
                            slug: category.slug,
                          },
                        }))
                      }
                      className={buttonStyles({ variant: "outline", size: "sm" })}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        handleUpdate(category.id, {
                          isActive: !category.isActive,
                        })
                      }
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                    >
                      {category.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleDelete(category)}
                      className={buttonStyles({ variant: "danger", size: "sm" })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
