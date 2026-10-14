"use client";

import { useEffect, useState } from "react";
import slugify from "slugify";
import { toast } from "sonner";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import Button from "@/app/components/reusable/Button";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { cn } from "@/lib/utils";

type Theme = "navy" | "purple" | "emerald";

type TaxonomyItem = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  theme?: string;
  orderIndex?: number;
};

type Draft = {
  name: string;
  slug: string;
  theme?: Theme;
  orderIndex?: number;
};

type Props = {
  title: string;
  description: string;
  endpoint: string;
  itemLabel: string;
  withTheme?: boolean;
  withOrder?: boolean;
  /** Contoh nama untuk placeholder & slug otomatis. */
  placeholder?: string;
};

const THEMES: Theme[] = ["navy", "purple", "emerald"];

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const THEME_CHIP: Record<Theme, string> = {
  navy: "bg-brand-navy-800 text-white",
  purple: "bg-brand-purple-600 text-white",
  emerald: "bg-brand-emerald-600 text-white",
};

function asTheme(value: string | undefined): Theme | undefined {
  return value === "navy" || value === "purple" || value === "emerald"
    ? value
    : undefined;
}

export default function TaxonomyManager({
  title,
  description,
  endpoint,
  itemLabel,
  withTheme = false,
  withOrder = false,
  placeholder,
}: Props) {
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [theme, setTheme] = useState<Theme>("navy");
  const [order, setOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Record<number, Draft>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(endpoint)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setItems(json.data ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint, refreshKey]);

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  async function handleCreate() {
    if (!name.trim()) {
      toast.error(`${itemLabel} name is required`);
      return;
    }
    const finalSlug =
      slug.trim() || slugify(name, { lower: true, strict: true });
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: finalSlug,
          ...(withTheme ? { theme } : {}),
          ...(withOrder ? { orderIndex: Number(order) || 0 } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to create");
      setName("");
      setSlug("");
      setOrder("0");
      toast.success(`${itemLabel} added`);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(
    id: number,
    patch: Partial<{
      name: string;
      slug: string;
      isActive: boolean;
      theme: Theme;
      orderIndex: number;
    }>,
  ) {
    setProcessingId(id);
    try {
      const res = await fetch(`${endpoint}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update");
      toast.success(`${itemLabel} updated`);
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

  async function handleDelete(item: TaxonomyItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setProcessingId(item.id);
    try {
      const res = await fetch(`${endpoint}?id=${item.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to delete");
      toast.success(`${itemLabel} deleted`);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Add form */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Add new
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.5fr_auto_auto] lg:items-end">
          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-foreground">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder={placeholder ?? "Name"}
            />
          </label>
          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-foreground">
              Slug
            </span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={cn(inputClass, "font-mono text-xs")}
              placeholder="auto from name"
            />
          </label>
          {withTheme && (
            <label className="space-y-1.5">
              <span className="block text-sm font-medium text-foreground">
                Theme
              </span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className={inputClass}
              >
                {THEMES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          )}
          {withOrder && (
            <label className="space-y-1.5">
              <span className="block text-sm font-medium text-foreground">
                Order
              </span>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className={inputClass}
              />
            </label>
          )}
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
        ) : items.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No entries yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const draft = editing[item.id];
              const isProcessing = processingId === item.id;

              if (draft) {
                return (
                  <li key={item.id} className="space-y-3 p-4">
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
                              [item.id]: { ...prev[item.id], name: e.target.value },
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
                              [item.id]: { ...prev[item.id], slug: e.target.value },
                            }))
                          }
                          className={cn(inputClass, "font-mono text-xs")}
                        />
                      </label>
                      {withTheme && (
                        <label className="space-y-1.5">
                          <span className="block text-xs font-medium text-muted-foreground">
                            Theme
                          </span>
                          <select
                            value={draft.theme ?? "navy"}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  theme: e.target.value as Theme,
                                },
                              }))
                            }
                            className={inputClass}
                          >
                            {THEMES.map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      {withOrder && (
                        <label className="space-y-1.5">
                          <span className="block text-xs font-medium text-muted-foreground">
                            Order
                          </span>
                          <input
                            type="number"
                            value={draft.orderIndex ?? 0}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  orderIndex: Number(e.target.value) || 0,
                                },
                              }))
                            }
                            className={inputClass}
                          />
                        </label>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        icon={Save}
                        isLoading={isProcessing}
                        onClick={() =>
                          handleUpdate(item.id, {
                            name: draft.name,
                            slug: draft.slug,
                            ...(withTheme ? { theme: draft.theme } : {}),
                            ...(withOrder
                              ? { orderIndex: draft.orderIndex ?? 0 }
                              : {}),
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
                            delete next[item.id];
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

              const itemTheme = asTheme(item.theme);
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          item.isActive
                            ? "text-foreground"
                            : "text-muted-foreground line-through",
                        )}
                      >
                        {item.name}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        /{item.slug}
                        {withOrder && item.orderIndex !== undefined
                          ? ` · order ${item.orderIndex}`
                          : ""}
                      </p>
                    </div>
                    {itemTheme && (
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium",
                          THEME_CHIP[itemTheme],
                        )}
                      >
                        {itemTheme}
                      </span>
                    )}
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium",
                        item.isActive
                          ? "bg-brand-mint-100 text-accent"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        setEditing((prev) => ({
                          ...prev,
                          [item.id]: {
                            name: item.name,
                            slug: item.slug,
                            theme: asTheme(item.theme),
                            orderIndex: item.orderIndex ?? 0,
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
                        handleUpdate(item.id, { isActive: !item.isActive })
                      }
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                    >
                      {item.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleDelete(item)}
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
