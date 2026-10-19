"use client";

import { useState } from "react";
import { toast } from "sonner";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

type PlatformFormProps = {
  id: number;
  name: string;
  slug: string;
};

export default function PlatformForm({ id, name, slug }: PlatformFormProps) {
  const [displayName, setDisplayName] = useState(name);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/cadmin/platform", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to save platform account");
      }
      setDisplayName(data.data.name);
      toast.success("Platform account updated");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save platform account",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Platform account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The identity that admin-created events are published under. It is not
          a login account.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
        <div>
          <label
            htmlFor="platform-name"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Display name
          </label>
          <input
            id="platform-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Shown as the host on public event pages.
          </p>
        </div>

        <div>
          <label
            htmlFor="platform-slug"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Slug
          </label>
          <input
            id="platform-slug"
            value={slug}
            readOnly
            className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
          />
        </div>

        <p className="text-xs text-muted-foreground">Account ID: {id}</p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className={buttonStyles({ variant: "primary", size: "md" })}
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
