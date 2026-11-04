"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ClipboardList,
  ExternalLink,
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
import { priceLines } from "@/lib/sponsors/money";
import { type SponsorTierAdmin } from "@/lib/sponsors/shared";

/*
 * ============================================================
 * ADMIN â€” PAKET SPONSOR PER EVENT
 * ============================================================
 *
 * Satu event punya beberapa paket (Diamond, Gold, ...). Setiap paket punya
 * daftar benefit bebas: judul + keterangan.
 *
 * Yang dijaga ketat di sini:
 * - Harga USD TIDAK dihitung otomatis dari kurs. Admin mengetik sendiri angka
 *   dollar yang mau ditampilkan; kurs hanya dicatat untuk audit. Menghitung
 *   otomatis membuat harga di halaman berubah tiap hari tanpa ada yang edit.
 * - Paket yang sudah dipakai pengajuan tidak bisa dihapus (server menolaknya
 *   dengan 409); tombolnya berubah jadi "turn off".
 */

type BenefitDraft = { title: string; detail: string };

type TierDraft = {
  name: string;
  priceAmount: string;
  displayUsd: string;
  fxRateUsed: string;
  isActive: boolean;
  sortOrder: string;
  benefits: BenefitDraft[];
};

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const emptyDraft = (sortOrder: number): TierDraft => ({
  name: "",
  priceAmount: "",
  displayUsd: "",
  fxRateUsed: "",
  isActive: true,
  sortOrder: String(sortOrder),
  benefits: [{ title: "", detail: "" }],
});

/**
 * Baca angka dari input admin.
 *
 * Input WAJIB berupa digit saja. Sebelumnya fungsi ini membuang semua karakter
 * non-digit, sehingga "1.650.000,50" menjadi 165000050 dan "-500" menjadi 500 —
 * dua-duanya lolos validasi server dan berubah menjadi harga publik yang sah
 * tapi keliru. Sekarang nilai yang mengandung pemisah, tanda, atau desimal
 * ditolak (mengembalikan NaN) supaya form bisa menampilkan kesalahan, bukan
 * menyimpan angka yang berbeda dari yang diketik.
 */
function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return Number.NaN;
  return Number(trimmed);
}

function tierToDraft(tier: SponsorTierAdmin): TierDraft {
  return {
    name: tier.name,
    priceAmount: String(tier.priceAmount),
    displayUsd: tier.displayUsd ? String(tier.displayUsd) : "",
    fxRateUsed: tier.fxRateUsed ? String(tier.fxRateUsed) : "",
    isActive: tier.isActive,
    sortOrder: String(tier.sortOrder),
    benefits:
      tier.benefits.length > 0
        ? tier.benefits.map((benefit) => ({
            title: benefit.title,
            detail: benefit.detail ?? "",
          }))
        : [{ title: "", detail: "" }],
  };
}

function draftToPayload(draft: TierDraft) {
  return {
    name: draft.name.trim(),
    priceAmount: toNumberOrNull(draft.priceAmount) ?? 0,
    displayUsd: toNumberOrNull(draft.displayUsd),
    fxRateUsed: toNumberOrNull(draft.fxRateUsed),
    isActive: draft.isActive,
    sortOrder: toNumberOrNull(draft.sortOrder) ?? 0,
    benefits: draft.benefits
      .filter((benefit) => benefit.title.trim())
      .map((benefit) => ({
        title: benefit.title.trim(),
        ...(benefit.detail.trim() ? { detail: benefit.detail.trim() } : {}),
      })),
  };
}

function firstError(errors: Record<string, string[] | undefined> | undefined) {
  if (!errors) return undefined;
  for (const list of Object.values(errors)) {
    if (list && list.length > 0) return list[0];
  }
  return undefined;
}

/**
 * Pesan kesalahan angka, atau null bila semua isian angka berupa digit saja.
 * Dipisahkan dari `draftToPayload` supaya form bisa menolak input sebelum
 * dikirim, bukan setelah server menerima angka yang sudah berubah.
 */
function firstInvalidNumber(draft: TierDraft): string | null {
  const fields: [string, string][] = [
    ["Price", draft.priceAmount],
    ["USD estimate", draft.displayUsd],
    ["Exchange rate", draft.fxRateUsed],
    ["Sort order", draft.sortOrder],
  ];

  for (const [label, value] of fields) {
    if (Number.isNaN(toNumberOrNull(value))) {
      return `${label} must be a whole number with digits only (no dots, commas or signs).`;
    }
  }

  return null;
}

export default function SponsorTiersManager({ eventId }: { eventId: number }) {
  const [event, setEvent] = useState<{ id: number; title: string } | null>(null);
  const [tiers, setTiers] = useState<SponsorTierAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<TierDraft>(emptyDraft(0));
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async (active?: { current: boolean }) => {
    try {
      const res = await fetch(`/api/cadmin/events/${eventId}/sponsor-tiers`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Could not load packages");
      if (active && !active.current) return;
      setEvent(json.event ?? null);
      setTiers(json.data ?? []);
      setLoadError(null);
    } catch (error) {
      if (active && !active.current) return;
      setLoadError(error instanceof Error ? error.message : "Could not load packages");
    } finally {
      if (!active || active.current) setLoading(false);
    }
  }, [eventId]);

  // Pemuatan data dijalankan sebagai callback (bukan statement langsung di
  // badan efek). Aturan react-hooks/set-state-in-effect memperlakukan
  // pemanggilan langsung sebagai setState sinkron; lewat callback, semua
  // perubahan state terjadi setelah await.
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
    () => (tiers.length > 0 ? Math.max(...tiers.map((tier) => tier.sortOrder)) + 1 : 0),
    [tiers],
  );

  function startCreate() {
    setEditingId("new");
    setDraft(emptyDraft(nextSortOrder));
  }

  function startEdit(tier: SponsorTierAdmin) {
    setEditingId(tier.id);
    setDraft(tierToDraft(tier));
  }

  function cancel() {
    setEditingId(null);
    setDraft(emptyDraft(0));
  }

  function updateBenefit(index: number, patch: Partial<BenefitDraft>) {
    setDraft((prev) => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) =>
        i === index ? { ...benefit, ...patch } : benefit,
      ),
    }));
  }

  function addBenefit() {
    setDraft((prev) => ({
      ...prev,
      benefits: [...prev.benefits, { title: "", detail: "" }],
    }));
  }

  function removeBenefit(index: number) {
    setDraft((prev) => ({
      ...prev,
      benefits:
        prev.benefits.length === 1
          ? [{ title: "", detail: "" }]
          : prev.benefits.filter((_, i) => i !== index),
    }));
  }

  async function save() {
    // Tolak lebih awal: input angka yang mengandung pemisah/tanda tidak boleh
    // diam-diam dibulatkan menjadi angka lain yang kebetulan valid di server.
    const numericError = firstInvalidNumber(draft);
    if (numericError) {
      toast.error(numericError);
      return;
    }

    setSaving(true);
    try {
      const isNew = editingId === "new";
      const url = isNew
        ? `/api/cadmin/events/${eventId}/sponsor-tiers`
        : `/api/cadmin/events/${eventId}/sponsor-tiers?tierId=${editingId}`;

      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftToPayload(draft)),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          firstError(json.errors) || json.message || "Could not save the package",
        );
      }

      toast.success(isNew ? "Package added" : "Package updated");
      cancel();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the package");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(tier: SponsorTierAdmin) {
    setBusyId(tier.id);
    try {
      const res = await fetch(
        `/api/cadmin/events/${eventId}/sponsor-tiers?tierId=${tier.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: tier.name,
            priceAmount: tier.priceAmount,
            displayUsd: tier.displayUsd,
            fxRateUsed: tier.fxRateUsed,
            benefits: tier.benefits,
            isActive: !tier.isActive,
            sortOrder: tier.sortOrder,
          }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Could not update the package");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the package");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(tier: SponsorTierAdmin) {
    if (tier.applicationCount > 0) {
      toast.error(
        `${tier.name} already has ${tier.applicationCount} application${
          tier.applicationCount > 1 ? "s" : ""
        }. Turn it off instead of deleting it.`,
      );
      return;
    }

    if (!confirm(`Delete "${tier.name}"? This cannot be undone.`)) return;

    setBusyId(tier.id);
    try {
      const res = await fetch(
        `/api/cadmin/events/${eventId}/sponsor-tiers?tierId=${tier.id}`,
        { method: "DELETE" },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Could not delete the package");
      toast.success("Package deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the package");
    } finally {
      setBusyId(null);
    }
  }

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-muted-foreground">Loading packagesâ€¦</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-4xl space-y-4 rounded-xl border border-border bg-card p-6">
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Sponsorship packages
          </h1>
          <p className="text-sm text-destructive">{loadError}</p>
          <Link href="/cadmin/events" className={buttonStyles({ variant: "outline" })}>
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
              Sponsorship
            </p>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              Packages
            </h1>
            <p className="text-sm text-muted-foreground">
              {event?.title ?? `Event #${eventId}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/cadmin/events" className={buttonStyles({ variant: "outline" })}>
              Back
            </Link>
            <Link
              href={`/cadmin/sponsor-applications?eventId=${eventId}`}
              className={buttonStyles({ variant: "secondary" })}
            >
              <ClipboardList className="h-4 w-4" />
              Applications
            </Link>
            <Button icon={Plus} onClick={startCreate} disabled={editingId !== null}>
              Add package
            </Button>
          </div>
        </header>

        <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Events without an active package show no sponsorship section on their
          public page.
        </p>

        {editingId !== null ? (
          <TierEditor
            title={editingId === "new" ? "New package" : "Edit package"}
            draft={draft}
            saving={saving}
            onChange={setDraft}
            onBenefitChange={updateBenefit}
            onAddBenefit={addBenefit}
            onRemoveBenefit={removeBenefit}
            onCancel={cancel}
            onSave={save}
          />
        ) : null}

        {tiers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">No packages yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the first package (Diamond, Gold, Booth Only, â€¦) to open
              sponsorship for this event.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {tiers.map((tier) => (
              <li
                key={tier.id}
                className={cn(
                  "rounded-xl border border-border bg-card p-5",
                  !tier.isActive && "opacity-70",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-lg font-semibold text-foreground">
                        {tier.name}
                      </h2>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs font-medium",
                          tier.isActive
                            ? "bg-brand-mint-100 text-accent"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {tier.isActive ? "Active" : "Off"}
                      </span>
                      {tier.applicationCount > 0 ? (
                        <span className="rounded-md bg-brand-lavender-100 px-2 py-0.5 text-xs font-medium text-secondary">
                          {tier.applicationCount} application
                          {tier.applicationCount > 1 ? "s" : ""}
                        </span>
                      ) : null}
                    </div>

                    <p className="text-sm font-medium text-foreground">
                      {priceLines({ amount: tier.priceAmount, currency: tier.currency, displayUsd: tier.displayUsd }).primary}
                      {priceLines({ amount: tier.priceAmount, currency: tier.currency, displayUsd: tier.displayUsd }).secondary ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {priceLines({ amount: tier.priceAmount, currency: tier.currency, displayUsd: tier.displayUsd }).secondary} (estimate)
                        </span>
                      ) : null}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Pencil}
                      onClick={() => startEdit(tier)}
                      disabled={busyId === tier.id || editingId !== null}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Power}
                      onClick={() => void toggleActive(tier)}
                      isLoading={busyId === tier.id}
                    >
                      {tier.isActive ? "Turn off" : "Turn on"}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => void remove(tier)}
                      disabled={busyId === tier.id}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {tier.benefits.length > 0 ? (
                  <ul className="mt-4 grid gap-1.5 border-t border-border pt-4 sm:grid-cols-2">
                    {tier.benefits.map((benefit, index) => (
                      <li key={`${benefit.title}-${index}`} className="text-sm">
                        <span className="font-medium text-foreground">
                          {benefit.title}
                        </span>
                        {benefit.detail ? (
                          <span className="text-muted-foreground"> â€” {benefit.detail}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                    No benefits listed yet.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          Prices and USD estimates are saved as typed. The public page never
          recalculates them.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
 * EDITOR
 * ============================================================ */

function TierEditor({
  title,
  draft,
  saving,
  onChange,
  onBenefitChange,
  onAddBenefit,
  onRemoveBenefit,
  onCancel,
  onSave,
}: {
  title: string;
  draft: TierDraft;
  saving: boolean;
  onChange: (draft: TierDraft) => void;
  onBenefitChange: (index: number, patch: Partial<BenefitDraft>) => void;
  onAddBenefit: () => void;
  onRemoveBenefit: (index: number) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const pricePreview = useMemo(() => {
    const amount = toNumberOrNull(draft.priceAmount);
    const usd = toNumberOrNull(draft.displayUsd);
    if (!amount) return null;
    return priceLines({ amount, currency: "IDR", displayUsd: usd });
  }, [draft.priceAmount, draft.displayUsd]);

  return (
    <section
      aria-label={title}
      className="space-y-5 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
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
        <label className="space-y-1.5 sm:col-span-2">
          <span className="block text-sm font-medium text-foreground">
            Package name <span className="text-destructive">*</span>
          </span>
          <input
            className={inputClass}
            value={draft.name}
            onChange={(event) => onChange({ ...draft, name: event.target.value })}
            placeholder="Gold Sponsor"
          />
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">
            Price (IDR) <span className="text-destructive">*</span>
          </span>
          <input
            className={inputClass}
            value={draft.priceAmount}
            onChange={(event) => onChange({ ...draft, priceAmount: event.target.value })}
            inputMode="numeric"
            placeholder="50000000"
          />
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">
            Display in USD (optional)
          </span>
          <input
            className={inputClass}
            value={draft.displayUsd}
            onChange={(event) => onChange({ ...draft, displayUsd: event.target.value })}
            inputMode="numeric"
            placeholder="3030"
          />
          <span className="block text-xs text-muted-foreground">
            Typed by you, not calculated.
          </span>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">
            Exchange rate used (optional)
          </span>
          <input
            className={inputClass}
            value={draft.fxRateUsed}
            onChange={(event) => onChange({ ...draft, fxRateUsed: event.target.value })}
            inputMode="numeric"
            placeholder="16500"
          />
          <span className="block text-xs text-muted-foreground">
            Recorded for audit only. Required when a USD figure is shown.
          </span>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">Order</span>
          <input
            className={inputClass}
            value={draft.sortOrder}
            onChange={(event) => onChange({ ...draft, sortOrder: event.target.value })}
            inputMode="numeric"
            placeholder="0"
          />
          <span className="block text-xs text-muted-foreground">
            Smaller numbers appear first.
          </span>
        </label>
      </div>

      {pricePreview ? (
        <p className="rounded-lg bg-brand-lavender-100/60 px-4 py-3 text-sm text-foreground">
          Shown publicly as{" "}
          <span className="font-semibold">{pricePreview.primary}</span>
          {pricePreview.secondary ? (
            <span className="text-muted-foreground">
              {" "}
              Â· {pricePreview.secondary} (estimate)
            </span>
          ) : null}
        </p>
      ) : null}

      <label className="flex items-center gap-2.5 rounded-lg border border-border px-4 py-3">
        <input
          type="checkbox"
          checked={draft.isActive}
          onChange={(event) => onChange({ ...draft, isActive: event.target.checked })}
          className="h-4 w-4 rounded-sm border-border accent-primary focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-sm text-foreground">
          Show this package on the public event page
        </span>
      </label>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">Benefits</h3>
          <Button variant="outline" size="sm" icon={Plus} onClick={onAddBenefit}>
            Add benefit
          </Button>
        </div>

        <ul className="space-y-2.5">
          {draft.benefits.map((benefit, index) => (
            <li key={index} className="flex flex-col gap-2 sm:flex-row">
              <input
                className={inputClass}
                value={benefit.title}
                onChange={(event) => onBenefitChange(index, { title: event.target.value })}
                placeholder="Seminar Sessions"
                aria-label={`Benefit ${index + 1} title`}
              />
              <input
                className={inputClass}
                value={benefit.detail}
                onChange={(event) => onBenefitChange(index, { detail: event.target.value })}
                placeholder="20 Minutes"
                aria-label={`Benefit ${index + 1} detail`}
              />
              <button
                type="button"
                onClick={() => onRemoveBenefit(index)}
                className="shrink-0 self-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove benefit ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">
          Leave a detail empty when the benefit has no extra note. Empty rows are
          ignored when saving.
        </p>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSave} isLoading={saving} icon={Check}>
          Save package
        </Button>
      </div>
    </section>
  );
}
