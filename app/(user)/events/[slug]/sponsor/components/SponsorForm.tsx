"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, CircleAlert } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import Button from "@/app/components/reusable/Button";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { cn } from "@/lib/utils";
import { priceLines } from "@/lib/sponsors/money";
import { PIC_TITLES, type SponsorBenefit } from "@/lib/sponsors/shared";
import {
  SPONSOR_EMAIL_PATTERN,
  SPONSOR_LIMITS,
  SPONSOR_WEBSITE_PATTERN,
} from "@/lib/validations/sponsor";
import { phoneCountryCode } from "@/lib/sponsors/phone";
import { useRecaptcha } from "@/app/hooks/useRecaptcha";
import CountryCombobox, { type CountryOption } from "./CountryCombobox";

type Tier = {
  id: number;
  name: string;
  priceAmount: number;
  currency: string;
  displayUsd: number | null;
  benefits: SponsorBenefit[];
};

type FormState = {
  companyName: string;
  address: string;
  countryCode: string;
  website: string;
  companyEmail: string;
  picFirstName: string;
  picLastName: string;
  picTitle: string;
  picPosition: string;
  picPhone: string;
  picEmail: string;
  notes: string;
};
const FIELD_ORDER = [
  "tierId",
  "companyName",
  "address",
  "countryCode",
  "website",
  "companyEmail",
  "picFirstName",
  "picLastName",
  "picPosition",
  "picPhone",
  "picEmail",
  "notes",
] as const;

const FULL_BENEFIT_LIMIT = 4;

const inputClass = (invalid: boolean) =>
  cn(
    "w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2",
    invalid
      ? "border-destructive focus:ring-destructive"
      : "border-border focus:ring-ring",
  );

export default function SponsorForm({
  eventId,
  eventSlug,
  tiers,
  preselectedTierId,
  countries,
}: {
  eventId: number;
  eventSlug: string;
  tiers: Tier[];
  preselectedTierId: number | null;
  countries: CountryOption[];
}) {
  const [form, setForm] = useState<FormState>({
    companyName: "",
    address: "",
    countryCode: "ID",
    website: "",
    companyEmail: "",
    picFirstName: "",
    picLastName: "",
    picTitle: "",
    picPosition: "",
    picPhone: "",
    picEmail: "",
    notes: "",
  });
  const [tierId, setTierId] = useState<number | null>(
    preselectedTierId ?? (tiers.length === 1 ? tiers[0].id : null),
  );
  const [differentPhoneCountry, setDifferentPhoneCountry] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState<string>("ID");
  const [openBenefits, setOpenBenefits] = useState<Set<number>>(
    () => new Set(preselectedTierId === null ? [] : [preselectedTierId]),
  );

  function toggleBenefits(id: number) {
    setOpenBenefits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    referenceNo: string;
    email: string;
  } | null>(null);

  const { execute: executeCaptcha } = useRecaptcha("sponsor_application");

  // Tidak ada variabel negara-telepon gabungan: di mode bawaan komponen
  // PhoneInput sendiri yang mengikuti negara, sehingga satu sumber kebenaran
  // saja. Di mode "different", `phoneCountry` mengaturnya.

  const selectedTier = useMemo(
    () => tiers.find((tier) => tier.id === tierId) ?? null,
    [tiers, tierId],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};

    if (!tierId) next.tierId = "Choose a sponsorship package";

    const companyName = form.companyName.trim();
    if (companyName.length < 2) next.companyName = "Company name is required";
    else if (companyName.length > SPONSOR_LIMITS.companyName)
      next.companyName = "Company name cannot exceed 255 characters";

    const address = form.address.trim();
    if (address.length < 5) next.address = "Company address is required";
    else if (address.length > SPONSOR_LIMITS.address)
      next.address = "Company address cannot exceed 2000 characters";

    if (!form.countryCode) next.countryCode = "Select the country";

    const website = form.website.trim();
    if (website.length > SPONSOR_LIMITS.website) {
      next.website = "Website cannot exceed 500 characters";
    } else if (website && !SPONSOR_WEBSITE_PATTERN.test(website)) {
      next.website = "Enter a full URL, e.g. https://example.com";
    }

    const companyEmail = form.companyEmail.trim();
    if (companyEmail && !SPONSOR_EMAIL_PATTERN.test(companyEmail)) {
      next.companyEmail = "Enter a valid company email";
    }

    if (!form.picFirstName.trim()) next.picFirstName = "First name is required";
    else if (form.picFirstName.trim().length > SPONSOR_LIMITS.personName)
      next.picFirstName = "First name cannot exceed 120 characters";

    if (!form.picLastName.trim()) next.picLastName = "Last name is required";
    else if (form.picLastName.trim().length > SPONSOR_LIMITS.personName)
      next.picLastName = "Last name cannot exceed 120 characters";

    const position = form.picPosition.trim();
    if (position.length < 2) next.picPosition = "Position is required";
    else if (position.length > SPONSOR_LIMITS.position)
      next.picPosition = "Position cannot exceed 255 characters";

    if (!form.picPhone.trim()) next.picPhone = "Phone number is required";

    // Satu pola email untuk kedua kolom, sama seperti `z.email()` di server.
    if (!SPONSOR_EMAIL_PATTERN.test(form.picEmail.trim())) {
      next.picEmail = "Enter a valid email address";
    }
    if (form.notes.trim().length > SPONSOR_LIMITS.notes)
      next.notes = "Note cannot exceed 1000 characters";

    return next;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      const firstKey =
        FIELD_ORDER.find((key) => clientErrors[key]) ??
        Object.keys(clientErrors)[0];
      document.getElementById(`sponsor-${firstKey}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setSubmitting(true);
    try {
      const captchaToken = await executeCaptcha();

      const res = await fetch(`/api/events/${eventId}/sponsor-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          tierId,
          companyName: form.companyName.trim(),
          address: form.address.trim(),
          countryCode: form.countryCode,
          website: form.website.trim(),
          companyEmail: form.companyEmail.trim(),
          picFirstName: form.picFirstName.trim(),
          picLastName: form.picLastName.trim(),
          picTitle: form.picTitle,
          picPosition: form.picPosition.trim(),
          picPhone: form.picPhone.trim(),
          picEmail: form.picEmail.trim(),
          notes: form.notes.trim(),
          captchaToken,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as {
        message?: string;
        data?: { referenceNo: string; email: string };
        errors?: Record<string, string[] | undefined>;
      };

      if (!res.ok) {
        if (json.errors) {
          const fieldErrors: Record<string, string> = {};
          for (const [key, list] of Object.entries(json.errors)) {
            if (list && list.length > 0) fieldErrors[key] = list[0];
          }
          setErrors(fieldErrors);
        }
        setFormError(
          json.message ?? "Could not submit your request. Please try again.",
        );
        return;
      }

      if (json.data) {
        setResult(json.data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setFormError(
        "Something went wrong. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ================= SELESAI ================= */

  if (result) {
    return (
      <div className="space-y-6 rounded-xl border border-border bg-card p-8 shadow-card">
        <div className="flex size-12 items-center justify-center rounded-full bg-brand-mint-100">
          <Check className="size-6 text-accent" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Request received
          </h2>
          <p className="text-sm text-muted-foreground">
            A confirmation with a PDF summary is on its way to{" "}
            <span className="font-medium text-foreground">{result.email}</span>.
            Our sponsorship team will contact you to arrange the invoice. No
            payment has been taken.
          </p>
        </div>

        <div className="rounded-lg bg-brand-lavender-100/70 px-5 py-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Your reference number
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-wider text-foreground">
            {result.referenceNo}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Keep this number — quote it in every message to our team.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/events/${eventSlug}`}
            className={buttonStyles({ size: "lg" })}
          >
            Back to the event
          </Link>
        </div>
      </div>
    );
  }

  /* ================= FORM ================= */

  const filledRequired = [
    tierId,
    form.companyName.trim(),
    form.address.trim(),
    form.countryCode,
    form.picFirstName.trim(),
    form.picLastName.trim(),
    form.picPosition.trim(),
    form.picPhone.trim(),
    form.picEmail.trim(),
  ].filter(Boolean).length;
  const requiredTotal = 9;
  const progress = Math.round((filledRequired / requiredTotal) * 100);
  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div className="sticky top-16 z-10 space-y-2 rounded-xl border border-border bg-card/95 p-3.5 backdrop-blur max-sm:static">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm">
            <span className="text-muted-foreground">Selected package: </span>
            <span className="font-semibold text-foreground">
              {selectedTier ? selectedTier.name : "none yet"}
            </span>
            {selectedTier
              ? (() => {
                  const price = priceLines({
                    amount: selectedTier.priceAmount,
                    currency: selectedTier.currency,
                    displayUsd: selectedTier.displayUsd,
                  });
                  return (
                    <span className="ml-1 text-muted-foreground">
                      · {price.primary}
                      {price.secondary ? ` (${price.secondary} est.)` : ""}
                    </span>
                  );
                })()
              : null}
          </p>
          <p className="text-xs text-muted-foreground">
            {filledRequired} of {requiredTotal} required fields
          </p>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Form completion"
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              progress === 100 ? "bg-accent" : "bg-secondary",
            )}
            style={{ width: `${Math.max(progress, 3)}%` }}
          />
        </div>
      </div>
      <fieldset id="sponsor-tierId" className="space-y-4">
        <legend className="font-heading text-xl font-semibold text-foreground">
          Sponsorship package
        </legend>

        <div className="grid gap-3 sm:grid-cols-2">
          {tiers.map((tier) => {
            const price = priceLines({
              amount: tier.priceAmount,
              currency: tier.currency,
              displayUsd: tier.displayUsd,
            });
            const checked = tierId === tier.id;

            return (
              <label
                key={tier.id}
                className={cn(
                  "flex cursor-pointer flex-col rounded-xl border p-4 transition-all duration-150",
                  checked
                    ? "border-primary bg-brand-lavender-100/50 ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/50 hover:bg-muted/30",
                  errors.tierId && !checked && "border-destructive",
                )}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {tier.name}
                    </span>
                    <span className="mt-0.5 block text-sm font-medium text-foreground">
                      {price.primary}
                    </span>
                    {price.secondary ? (
                      <span className="block text-xs text-muted-foreground">
                        {price.secondary} estimate
                      </span>
                    ) : null}
                  </span>
                  <input
                    type="radio"
                    name="sponsor-tier"
                    value={tier.id}
                    checked={checked}
                    onChange={() => {
                      setTierId(tier.id);
                      setOpenBenefits(new Set([tier.id]));
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.tierId;
                        return next;
                      });
                    }}
                    className="mt-1 h-4 w-4 shrink-0 accent-primary"
                  />
                </span>

                {tier.benefits.length > 0 ? (
                  <span className="mt-3 border-t border-border pt-3">
                    <span
                      id={`sponsor-tier-${tier.id}-benefits`}
                      className={cn(
                        "block space-y-1 overflow-hidden text-xs text-muted-foreground",
                        !openBenefits.has(tier.id) && "max-h-24",
                      )}
                    >
                      {tier.benefits.map((benefit, index) => (
                        <span key={index} className="block">
                          {benefit.title}
                          {benefit.detail ? ` — ${benefit.detail}` : ""}
                        </span>
                      ))}
                    </span>

                    {tier.benefits.length > FULL_BENEFIT_LIMIT ? (
                      <button
                        type="button"
                        onClick={() => toggleBenefits(tier.id)}
                        aria-expanded={openBenefits.has(tier.id)}
                        aria-controls={`sponsor-tier-${tier.id}-benefits`}
                        className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        {openBenefits.has(tier.id)
                          ? "Show less"
                          : `Show all ${tier.benefits.length} benefits`}
                        <ChevronDown
                          className={cn(
                            "size-3.5 transition-transform duration-150",
                            openBenefits.has(tier.id) && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    ) : null}
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>

        {errors.tierId ? <FieldError>{errors.tierId}</FieldError> : null}
      </fieldset>

      {/* 2. COMPANY */}
      <fieldset className="space-y-4">
        <legend className="font-heading text-xl font-semibold text-foreground">
          Company information
        </legend>

        <Field
          label="Company name"
          htmlFor="sponsor-companyName"
          required
          error={errors.companyName}
        >
          <input
            id="sponsor-companyName"
            className={inputClass(Boolean(errors.companyName))}
            value={form.companyName}
            onChange={(event) => update("companyName", event.target.value)}
            placeholder="PT Contoh Sehat Indonesia"
            autoComplete="organization"
          />
        </Field>

        <Field
          label="Company address"
          htmlFor="sponsor-address"
          required
          error={errors.address}
        >
          <textarea
            id="sponsor-address"
            rows={3}
            className={cn("resize-y", inputClass(Boolean(errors.address)))}
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
            placeholder="Street, city, postal code"
            autoComplete="street-address"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Country"
            htmlFor="sponsor-countryCode"
            required
            error={errors.countryCode}
          >
            <CountryCombobox
              id="sponsor-countryCode"
              options={countries}
              value={form.countryCode}
              onChange={(code) => update("countryCode", code)}
              invalid={Boolean(errors.countryCode)}
            />
          </Field>

          <Field
            label="Website"
            htmlFor="sponsor-website"
            hint="Optional"
            error={errors.website}
          >
            <input
              id="sponsor-website"
              className={inputClass(Boolean(errors.website))}
              value={form.website}
              onChange={(event) => update("website", event.target.value)}
              placeholder="https://example.com"
              inputMode="url"
              autoComplete="url"
            />
          </Field>
        </div>

        <Field
          label="Company email"
          htmlFor="sponsor-companyEmail"
          hint="Optional — useful if invoices should go to a different address."
          error={errors.companyEmail}
        >
          <input
            id="sponsor-companyEmail"
            type="email"
            className={inputClass(Boolean(errors.companyEmail))}
            value={form.companyEmail}
            onChange={(event) => update("companyEmail", event.target.value)}
            placeholder="finance@example.com"
            autoComplete="email"
          />
        </Field>
      </fieldset>

      {/* 3. CONTACT PERSON */}
      <fieldset className="space-y-4">
        <legend className="font-heading text-xl font-semibold text-foreground">
          Contact person
        </legend>

        <div className="grid gap-4 sm:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1fr)]">
          <Field label="Title" htmlFor="sponsor-picTitle" hint="Optional">
            <select
              id="sponsor-picTitle"
              className={inputClass(false)}
              value={form.picTitle}
              onChange={(event) => update("picTitle", event.target.value)}
            >
              <option value="">—</option>
              {PIC_TITLES.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="First name"
            htmlFor="sponsor-picFirstName"
            required
            error={errors.picFirstName}
          >
            <input
              id="sponsor-picFirstName"
              className={inputClass(Boolean(errors.picFirstName))}
              value={form.picFirstName}
              onChange={(event) => update("picFirstName", event.target.value)}
              autoComplete="given-name"
            />
          </Field>

          <Field
            label="Last name"
            htmlFor="sponsor-picLastName"
            required
            error={errors.picLastName}
          >
            <input
              id="sponsor-picLastName"
              className={inputClass(Boolean(errors.picLastName))}
              value={form.picLastName}
              onChange={(event) => update("picLastName", event.target.value)}
              autoComplete="family-name"
            />
          </Field>
        </div>

        <Field
          label="Position"
          htmlFor="sponsor-picPosition"
          required
          error={errors.picPosition}
        >
          <input
            id="sponsor-picPosition"
            className={inputClass(Boolean(errors.picPosition))}
            value={form.picPosition}
            onChange={(event) => update("picPosition", event.target.value)}
            placeholder="Head of Partnerships"
            autoComplete="organization-title"
          />
        </Field>

        <div className="space-y-2">
          <Field
            label="Phone number"
            htmlFor="sponsor-picPhone"
            required
            error={errors.picPhone}
          >
            <div
              className={cn(
                "[&_.PhoneInput]:w-full [&_.PhoneInputInput]:rounded-r-lg [&_.PhoneInputInput]:border [&_.PhoneInputInput]:border-border [&_.PhoneInputInput]:bg-card [&_.PhoneInputInput]:px-4 [&_.PhoneInputInput]:py-2.5 [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-foreground [&_.PhoneInputInput]:focus:outline-none [&_.PhoneInputInput]:focus:ring-2 [&_.PhoneInputInput]:focus:ring-ring",
                errors.picPhone && "[&_.PhoneInputInput]:border-destructive",
              )}
            >
              <PhoneInput
                id="sponsor-picPhone"
                international
                defaultCountry="ID"
                country={
                  differentPhoneCountry ? (phoneCountry as never) : undefined
                }
                onCountryChange={(code) => {
                  if (differentPhoneCountry && code) setPhoneCountry(code);
                }}
                value={form.picPhone || undefined}
                onChange={(value) => update("picPhone", value ?? "")}
                placeholder="+62 812 3456 7890"
                autoComplete="tel"
              />
            </div>
          </Field>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {differentPhoneCountry ? (
              <>
                <span>Phone country:</span>
                <CountryCombobox
                  id="sponsor-phoneCountry"
                  ariaLabel="Phone country"
                  options={countries}
                  value={phoneCountry}
                  onChange={setPhoneCountry}
                />
                <button
                  type="button"
                  onClick={() => {
                    setDifferentPhoneCountry(false);
                    setPhoneCountry(form.countryCode);
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  Use company country
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  // Negara awal diambil dari nomor itu sendiri, memakai
                  // helper yang sama dengan validasi server.
                  const owner = phoneCountryCode(form.picPhone);

                  setPhoneCountry(owner ?? form.countryCode);
                  setDifferentPhoneCountry(true);
                }}
                className="font-medium text-primary hover:underline"
              >
                Different country
              </button>
            )}
          </div>
        </div>

        <Field
          label="Email"
          htmlFor="sponsor-picEmail"
          required
          error={errors.picEmail}
        >
          <input
            id="sponsor-picEmail"
            type="email"
            className={inputClass(Boolean(errors.picEmail))}
            value={form.picEmail}
            onChange={(event) => update("picEmail", event.target.value)}
            placeholder="you@mail.com"
            autoComplete="email"
          />
        </Field>
      </fieldset>

      {/* 4. NOTE */}
      <fieldset className="space-y-3">
        <legend className="font-heading text-xl font-semibold text-foreground">
          Note to organizer
        </legend>
        <Field
          label="Anything we should know?"
          htmlFor="sponsor-notes"
          hint={`Optional — ${1000 - form.notes.length} characters left`}
          error={errors.notes}
        >
          <textarea
            id="sponsor-notes"
            rows={4}
            maxLength={1000}
            className={cn("resize-y", inputClass(Boolean(errors.notes)))}
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Special requests, invoice details, PO number, etc."
          />
        </Field>
      </fieldset>

      {formError ? (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3"
        >
          <CircleAlert
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <p className="text-sm text-destructive">{formError}</p>
        </div>
      ) : null}

      {/*
       * Kalau ada isian yang belum benar setelah menekan submit, sebutkan
       * jumlahnya di sini — bukan membiarkan pengguna menggulir seluruh form
       * untuk menemukan satu field merah.
       */}
      {errorCount > 0 ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {errorCount} field{errorCount > 1 ? "s" : ""} need
          {errorCount > 1 ? "" : "s"} your attention. The first one is
          highlighted above.
        </div>
      ) : null}

      <div className="border-t border-border pt-4 sm:sticky sm:bottom-0 sm:-mx-1 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:bg-background/95 sm:px-1 sm:py-4 sm:backdrop-blur">
        <Button
          type="submit"
          size="lg"
          isLoading={submitting}
          icon={ArrowRight}
          iconPosition="right"
          className="mt-3 w-full sm:mt-0 sm:w-auto"
        >
          Submit request
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      {children}
      {error ? (
        <FieldError>{error}</FieldError>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-destructive">{children}</p>;
}
