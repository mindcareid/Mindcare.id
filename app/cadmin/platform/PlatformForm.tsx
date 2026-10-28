"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import ImageUploadField from "@/app/components/reusable/ImageUploadField";

type PlatformFormProps = {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  logoPublicId: string | null;
  isVerified: boolean;
};

export default function PlatformForm({
  id,
  name,
  slug,
  logoUrl,
  logoPublicId,
  isVerified,
}: PlatformFormProps) {
  const [displayName, setDisplayName] = useState(name);
  const [logo, setLogo] = useState({
    url: logoUrl,
    publicId: logoPublicId,
  });
  const [verified, setVerified] = useState(isVerified);
  const [saving, setSaving] = useState(false);

  // Aset yang diganti/dihapus ditahan dulu; baru dihapus dari Cloudinary
  // setelah data benar-benar tersimpan (lihat `deferDelete` di ImageUploadField).
  const discarded = useRef<Set<string>>(new Set());

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/cadmin/platform", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          logoUrl: logo.url,
          logoPublicId: logo.publicId,
          isVerified: verified,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to save platform account");
      }
      setDisplayName(data.data.name);
      setLogo({ url: data.data.logoUrl, publicId: data.data.logoPublicId });
      setVerified(data.data.isVerified);

      for (const publicId of discarded.current) {
        if (publicId === data.data.logoPublicId) continue;
        await fetch("/api/cloudinary/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId }),
        }).catch(() => undefined);
      }
      discarded.current.clear();

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

        <ImageUploadField
          label="Logo"
          hint="Square image, shown on the host card of MindCare events."
          entityType="platform"
          aspect={1}
          shape="square"
          maxWidth={512}
          maxHeight={512}
          value={logo}
          deferDelete
          onDiscard={(publicIds) => {
            for (const publicId of publicIds) discarded.current.add(publicId);
          }}
          onChange={setLogo}
        />

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="mt-0.5 h-5 w-5"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">
              Show the official badge
            </span>
            <span className="block text-xs text-muted-foreground">
              Adds a verified mark to the host card. Keep this on for MindCare.
            </span>
          </span>
        </label>

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
