"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ClipboardList,
  ExternalLink,
  ImageUp,
  Pencil,
  Plus,
  Power,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import Button from "@/app/components/reusable/Button";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import {
  SPONSOR_LOGO_GAP,
  SPONSOR_LOGO_HEIGHT,
  SPONSOR_LOGO_MAX_WIDTH,
  type EventSponsorAdmin,
} from "@/lib/sponsors/shared";

type TierOption = { id: number; name: string; isActive: boolean };

type SponsorDraft = {
  tierId: string;
  name: string;
  websiteUrl: string;
  isActive: boolean;
  sortOrder: string;
  logoUrl: string;
  logoPublicId: string;
};

type ReviewedApplication = {
  id: number;
  companyName: string;
  website: string | null;
  tier: { id: number; name: string };
};

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const emptyDraft = (tierId?: number, sortOrder = 0): SponsorDraft => ({
  tierId: tierId ? String(tierId) : "",
  name: "",
  websiteUrl: "",
  isActive: true,
  sortOrder: String(sortOrder),
  logoUrl: "",
  logoPublicId: "",
});

function sponsorToDraft(sponsor: EventSponsorAdmin): SponsorDraft {
  return {
    tierId: String(sponsor.tierId),
    name: sponsor.name,
    websiteUrl: sponsor.websiteUrl ?? "",
    isActive: sponsor.isActive,
    sortOrder: String(sponsor.sortOrder),
    logoUrl: sponsor.logoUrl,
    logoPublicId: sponsor.logoPublicId,
  };
}

function draftToPayload(draft: SponsorDraft) {
  return {
    tierId: Number(draft.tierId),
    name: draft.name.trim(),
    websiteUrl: draft.websiteUrl.trim(),
    isActive: draft.isActive,
    sortOrder: Number(draft.sortOrder) || 0,
    logoUrl: draft.logoUrl,
    logoPublicId: draft.logoPublicId,
  };
}

function firstError(errors: Record<string, string[] | undefined> | undefined) {
  if (!errors) return undefined;
  for (const list of Object.values(errors)) {
    if (list && list.length > 0) return list[0];
  }
  return undefined;
}

export default function SponsorLogosManager({
  eventId,
  tiers,
}: {
  eventId: number;
  tiers: TierOption[];
}) {
  const [sponsors, setSponsors] = useState<EventSponsorAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<SponsorDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const pendingUploads = useRef<Set<string>>(new Set());

  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [applications, setApplications] = useState<ReviewedApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const load = useCallback(
    async (active?: { current: boolean }) => {
      try {
        const res = await fetch(`/api/cadmin/events/${eventId}/sponsors`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Could not load sponsors");
        if (active && !active.current) return;
        setSponsors(json.sponsors ?? []);
        setLoadError(null);
      } catch (error) {
        if (active && !active.current) return;
        setLoadError(
          error instanceof Error ? error.message : "Could not load sponsors",
        );
      } finally {
        if (!active || active.current) setLoading(false);
      }
    },
    [eventId],
  );

  useEffect(() => {
    const active = { current: true };
    const run = () => {
      void load(active);
    };
    run();
    return () => {
      active.current = false;
    };
  }, [load]);

  const nextSortOrder = useMemo(
    () =>
      sponsors.length > 0
        ? Math.max(...sponsors.map((sponsor) => sponsor.sortOrder)) + 1
        : 0,
    [sponsors],
  );

  const grouped = useMemo(() => {
    return tiers
      .map((tier) => ({
        tier,
        rows: sponsors.filter((sponsor) => sponsor.tierId === tier.id),
      }))
      .filter((group) => group.rows.length > 0);
  }, [tiers, sponsors]);

  function cleanupPendingUploads(keepPublicId?: string | null) {
    for (const publicId of Array.from(pendingUploads.current)) {
      if (publicId === keepPublicId) continue;
      pendingUploads.current.delete(publicId);
      void fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
    }
  }

  function startCreate(tierId?: number) {
    cleanupPendingUploads();
    setEditingId("new");
    setDraft(emptyDraft(tierId ?? tiers[0]?.id, nextSortOrder));
  }

  function startEdit(sponsor: EventSponsorAdmin) {
    cleanupPendingUploads();
    setEditingId(sponsor.id);
    setDraft(sponsorToDraft(sponsor));
  }

  function cancel() {
    cleanupPendingUploads();
    setEditingId(null);
    setDraft(emptyDraft());
  }

  async function handleLogoUpload(file: File) {
    setUploading(true);
    try {
      const data = await uploadToCloudinary(file, "event-sponsor-logos");
      pendingUploads.current.add(data.public_id);
      setDraft((prev) => ({
        ...prev,
        logoUrl: data.secure_url,
        logoPublicId: data.public_id,
      }));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Logo upload failed",
      );
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!draft.tierId) {
      toast.error("Choose a package for this sponsor.");
      return;
    }
    if (!draft.logoUrl || !draft.logoPublicId) {
      toast.error("Upload a logo before saving.");
      return;
    }

    setSaving(true);
    try {
      const isNew = editingId === "new";
      const url = isNew
        ? `/api/cadmin/events/${eventId}/sponsors`
        : `/api/cadmin/events/${eventId}/sponsors?sponsorId=${editingId}`;

      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftToPayload(draft)),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          firstError(json.errors) ||
            json.message ||
            "Could not save the sponsor",
        );
      }

      // Logo yang sudah tersimpan bukan lagi "pending".
      pendingUploads.current.delete(draft.logoPublicId);
      cleanupPendingUploads();

      toast.success(isNew ? "Sponsor added" : "Sponsor updated");
      setEditingId(null);
      setDraft(emptyDraft());
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the sponsor",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(sponsor: EventSponsorAdmin) {
    setBusyId(sponsor.id);
    try {
      const res = await fetch(
        `/api/cadmin/events/${eventId}/sponsors?sponsorId=${sponsor.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...sponsor, isActive: !sponsor.isActive }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json.message || "Could not update the sponsor");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update the sponsor",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function remove(sponsor: EventSponsorAdmin) {
    if (
      !confirm(
        `Remove "${sponsor.name}" from this event? The logo file is deleted too.`,
      )
    )
      return;

    setBusyId(sponsor.id);
    try {
      const res = await fetch(
        `/api/cadmin/events/${eventId}/sponsors?sponsorId=${sponsor.id}`,
        { method: "DELETE" },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json.message || "Could not delete the sponsor");

      toast.success("Sponsor removed");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete the sponsor",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function openApplications() {
    setApplicationsOpen(true);
    if (applications.length > 0) return;

    setApplicationsLoading(true);
    try {
      const res = await fetch(
        `/api/cadmin/sponsor-applications?eventId=${eventId}&status=REVIEWED&page=1`,
        { cache: "no-store" },
      );
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || "Could not load applications");
      setApplications((json.data ?? []) as ReviewedApplication[]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load applications",
      );
    } finally {
      setApplicationsLoading(false);
    }
  }

  function applyApplication(application: ReviewedApplication) {
    cleanupPendingUploads();
    setEditingId("new");
    setDraft({
      ...emptyDraft(application.tier.id, nextSortOrder),
      name: application.companyName,
      websiteUrl: application.website ?? "",
    });
    setApplicationsOpen(false);
  }

  if (loading) {
    return (
      <section className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Loading sponsor logos…</p>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Sponsor logos
          </h2>
          <p className="text-sm text-muted-foreground">
            Companies shown on the public event page, grouped by package.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={ClipboardList}
            onClick={() => void openApplications()}
            disabled={editingId !== null}
          >
            Use an application
          </Button>
          <Button
            size="sm"
            icon={Plus}
            onClick={() => startCreate()}
            disabled={editingId !== null || tiers.length === 0}
          >
            Add sponsor
          </Button>
        </div>
      </header>

      {tiers.length === 0 ? (
        <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Add a package first. A sponsor logo must belong to one of this
          event&apos;s packages.
        </p>
      ) : null}

      {loadError ? (
        <p className="text-sm text-destructive">{loadError}</p>
      ) : null}

      {applicationsOpen ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              Reviewed applications
            </h3>
            <button
              type="button"
              onClick={() => setApplicationsOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close applications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {applicationsLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reviewed applications for this event yet.{" "}
              <Link
                href={`/cadmin/sponsor-applications?eventId=${eventId}`}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Review applications
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {applications.map((application) => (
                <li
                  key={application.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {application.companyName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {application.tier.name}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyApplication(application)}
                  >
                    Use
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted-foreground">
            This only fills the company name and website. You still choose the
            package and upload the logo.
          </p>
        </div>
      ) : null}

      {editingId !== null ? (
        <SponsorEditor
          title={editingId === "new" ? "New sponsor" : "Edit sponsor"}
          draft={draft}
          tiers={tiers}
          saving={saving}
          uploading={uploading}
          onChange={setDraft}
          onUpload={handleLogoUpload}
          onCancel={cancel}
          onSave={save}
        />
      ) : null}

      {grouped.length === 0 && editingId === null ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">No sponsors yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the first sponsor to show its logo on the public event page.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ tier, rows }) => (
            <div key={tier.id} className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {tier.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {rows.length} sponsor{rows.length > 1 ? "s" : ""}
                </span>
              </div>

              <ul className="space-y-2">
                {rows.map((sponsor) => (
                  <li
                    key={sponsor.id}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5",
                      !sponsor.isActive && "opacity-60",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <LogoThumb src={sponsor.logoUrl} alt={sponsor.name} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {sponsor.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {sponsor.isActive ? "Shown publicly" : "Hidden"}
                          {sponsor.websiteUrl ? " · has website link" : ""}
                          {` · order ${sponsor.sortOrder}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Pencil}
                        onClick={() => startEdit(sponsor)}
                        disabled={busyId === sponsor.id || editingId !== null}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Power}
                        onClick={() => void toggleActive(sponsor)}
                        isLoading={busyId === sponsor.id}
                      >
                        {sponsor.isActive ? "Hide" : "Show"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => void remove(sponsor)}
                        disabled={busyId === sponsor.id}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          All logos appear at {SPONSOR_LOGO_HEIGHT}px tall with{" "}
          {SPONSOR_LOGO_GAP}px spacing on the event page. Check the preview: at
          that size a mark without a readable name looks like an empty square.
        </p>
        <Link
          href="/cadmin/sponsor-applications"
          className={buttonStyles({ variant: "ghost", size: "sm" })}
        >
          All applications
        </Link>
      </div>
    </section>
  );
}

function LogoThumb({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="relative flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-white">
      <Image
        src={src}
        alt={`${alt} logo`}
        fill
        sizes="96px"
        className="object-contain p-1.5"
      />
    </span>
  );
}

function PublicSizePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="mt-3 flex w-full flex-wrap items-center gap-3 rounded-lg border border-border bg-white px-4 py-3">
      <span className="shrink-0 text-xs text-muted-foreground">
        On the event page ({SPONSOR_LOGO_HEIGHT}px):
      </span>
      <Image
        src={src}
        alt={`${alt} preview at public size`}
        style={{
          height: SPONSOR_LOGO_HEIGHT,
          width: "auto",
          maxWidth: SPONSOR_LOGO_MAX_WIDTH,
        }}
      />
    </span>
  );
}

function SponsorEditor({
  title,
  draft,
  tiers,
  saving,
  uploading,
  onChange,
  onUpload,
  onCancel,
  onSave,
}: {
  title: string;
  draft: SponsorDraft;
  tiers: TierOption[];
  saving: boolean;
  uploading: boolean;
  onChange: (draft: SponsorDraft) => void;
  onUpload: (file: File) => Promise<void>;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-5 rounded-lg border border-border bg-muted/30 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-base font-semibold text-foreground">
          {title}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close editor"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">
            Package <span className="text-destructive">*</span>
          </span>
          <select
            className={inputClass}
            value={draft.tierId}
            onChange={(event) =>
              onChange({ ...draft, tierId: event.target.value })
            }
          >
            <option value="">Choose a package…</option>
            {tiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name}
                {tier.isActive ? "" : " (off)"}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">
            Sponsor name <span className="text-destructive">*</span>
          </span>
          <input
            className={inputClass}
            value={draft.name}
            onChange={(event) =>
              onChange({ ...draft, name: event.target.value })
            }
            placeholder="BCA"
          />
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className="block text-sm font-medium text-foreground">
            Website (optional)
          </span>
          <input
            className={inputClass}
            value={draft.websiteUrl}
            onChange={(event) =>
              onChange({ ...draft, websiteUrl: event.target.value })
            }
            placeholder="https://example.com"
          />
          <span className="block text-xs text-muted-foreground">
            When filled, the logo links to this site.
          </span>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">
            Order
          </span>
          <input
            className={inputClass}
            value={draft.sortOrder}
            onChange={(event) =>
              onChange({ ...draft, sortOrder: event.target.value })
            }
            inputMode="numeric"
            placeholder="0"
          />
          <span className="block text-xs text-muted-foreground">
            Smaller numbers appear first within the package.
          </span>
        </label>
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium text-foreground">
          Logo <span className="text-destructive">*</span>
        </span>

        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-border bg-card p-4">
          {draft.logoUrl ? (
            <span className="relative flex h-16 w-28 items-center justify-center overflow-hidden rounded-md border border-border bg-white">
              <Image
                src={draft.logoUrl}
                alt="Logo preview"
                fill
                sizes="112px"
                className="object-contain p-2"
              />
            </span>
          ) : (
            <span className="flex h-16 w-28 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <ImageUp className="h-5 w-5" aria-hidden="true" />
            </span>
          )}

          <div className="space-y-1.5">
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onUpload(file);
                event.target.value = "";
              }}
              className="block text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-brand-mint-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent hover:file:bg-brand-mint-100/70"
            />
            <p className="text-xs text-muted-foreground">
              {uploading
                ? "Uploading…"
                : "PNG with a transparent background works best. The image keeps its aspect ratio and is shown without stretching."}
            </p>
          </div>
        </div>

        {draft.logoUrl ? (
          <PublicSizePreview
            src={draft.logoUrl}
            alt={draft.name || "Sponsor"}
          />
        ) : null}
      </div>

      <label className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-3">
        <input
          type="checkbox"
          checked={draft.isActive}
          onChange={(event) =>
            onChange({ ...draft, isActive: event.target.checked })
          }
          className="h-4 w-4 rounded-sm border-border accent-primary focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-sm text-foreground">
          Show this logo on the public event page
        </span>
      </label>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={onSave}
          isLoading={saving}
          disabled={uploading}
          icon={Check}
        >
          Save sponsor
        </Button>
      </div>
    </div>
  );
}
