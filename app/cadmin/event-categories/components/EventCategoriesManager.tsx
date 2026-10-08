"use client";

import { useEffect, useState } from "react";
import slugify from "slugify";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import Button from "@/app/components/reusable/Button";

type EventCategory = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
};

export default function EventCategoriesManager() {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<
    Record<number, { name: string; slug: string }>
  >({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/event-categories");
        const json = await res.json();
        if (!cancelled) setCategories(json.data ?? []);
      } catch {
        if (!cancelled) toast.error("Could not load categories");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
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
    try {
      const res = await fetch(`/api/event-categories?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update");
      toast.success("Category updated");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function handleDelete(category: EventCategory) {
    if (!confirm(`Delete "${category.name}"?`)) return;
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
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Add a category
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-foreground">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="auto from name"
            />
          </label>
          <Button
            type="button"
            icon={Plus}
            disabled={saving}
            onClick={handleCreate}
          >
            Add
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
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
              return (
                <li
                  key={category.id}
                  className="flex flex-wrap items-center gap-3 p-4"
                >
                  <div className="min-w-0 flex-1 grid gap-3 sm:grid-cols-2">
                    <input
                      value={draft?.name ?? category.name}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          [category.id]: {
                            name: e.target.value,
                            slug: prev[category.id]?.slug ?? category.slug,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      value={draft?.slug ?? category.slug}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          [category.id]: {
                            name: prev[category.id]?.name ?? category.name,
                            slug: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={category.isActive}
                      onChange={(e) =>
                        handleUpdate(category.id, {
                          isActive: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    Active
                  </label>

                  <div className="flex gap-2">
                    {draft ? (
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdate(category.id, {
                            name: draft.name,
                            slug: draft.slug,
                          });
                          setEditing((prev) => {
                            const next = { ...prev };
                            delete next[category.id];
                            return next;
                          });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-destructive"
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
