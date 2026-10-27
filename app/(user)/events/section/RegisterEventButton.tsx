"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { Loader2, CheckCircle2, AlertTriangle, Mail } from "lucide-react";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

export type AttendeeFieldInput = {
  id: string;
  label: string;
  key: string;
  type: string;
  required: boolean;
  options: unknown;
};

type RegisterEventButtonProps = {
  eventId: number;
  title: string;
  price: number;
  remaining: number | null;
  soldOut: boolean;
  ended: boolean;
  attendeeFields: AttendeeFieldInput[];
};

type FieldDef = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  options: unknown;
};

type Attendee = Record<string, string>;

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const BASE_FIELDS: FieldDef[] = [
  {
    key: "name",
    label: "Full name",
    type: "TEXT",
    required: true,
    options: null,
  },
  {
    key: "email",
    label: "Email",
    type: "EMAIL",
    required: true,
    options: null,
  },
  {
    key: "phone",
    label: "Phone",
    type: "PHONE",
    required: true,
    options: null,
  },
];

const MAX_TICKETS = 10;

function parseOptions(options: unknown): { label: string; value: string }[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .map((option) => {
      if (typeof option === "string") {
        return { label: option, value: option };
      }

      if (
        option &&
        typeof option === "object" &&
        "value" in option &&
        typeof (option as { value: unknown }).value === "string"
      ) {
        const value = (option as { value: string; label?: unknown }).value;
        const label =
          typeof (option as { label?: unknown }).label === "string"
            ? (option as { label: string }).label
            : value;

        return { label, value };
      }

      return null;
    })
    .filter(
      (option): option is { label: string; value: string } => option !== null,
    );
}

export default function RegisterEventButton({
  eventId,
  title,
  price,
  remaining,
  soldOut,
  ended,
  attendeeFields,
}: RegisterEventButtonProps) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [attendees, setAttendees] = useState<Attendee[]>([{}]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === "authenticated";

  // Satu key per percobaan pendaftaran. Dipakai ulang kalau submit
  // diulang karena jaringan, supaya backend tidak membuat order ganda.
  const idempotencyKeyRef = useRef<string | null>(null);

  function getOrCreateIdempotencyKey() {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    return idempotencyKeyRef.current;
  }

  const fields = useMemo<FieldDef[]>(() => {
    const baseKeys = new Set(BASE_FIELDS.map((field) => field.key));

    return [
      ...BASE_FIELDS,
      ...attendeeFields
        .filter((field) => !baseKeys.has(field.key))
        .map((field) => ({
          key: field.key,
          label: field.label + (field.required ? "" : " (optional)"),
          type: field.type,
          required: field.required,
          options: field.options,
        })),
    ];
  }, [attendeeFields]);

  const maxTickets = Math.min(remaining ?? MAX_TICKETS, MAX_TICKETS);
  const isFree = price <= 0;

  function handleQuantityChange(value: number) {
    setQuantity(value);
    setAttendees((prev) => {
      const next = [...prev];

      while (next.length < value) {
        next.push({});
      }

      return next.slice(0, value);
    });
  }

  function updateAttendee(index: number, key: string, value: string) {
    setAttendees((prev) =>
      prev.map((attendee, i) =>
        i === index ? { ...attendee, [key]: value } : attendee,
      ),
    );
  }

  async function handleSubmit() {
    setError(null);

    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i];

      for (const field of fields) {
        if (field.required && !attendee[field.key]?.trim()) {
          setError(`"${field.label.replace(" (optional)", "")}" is required.`);
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": getOrCreateIdempotencyKey(),
        },
        body: JSON.stringify({ eventId, attendees }),
      });

      if (res.status === 401) {
        const callbackUrl = encodeURIComponent(
          `${window.location.pathname}${window.location.search}`,
        );
        window.location.href = `/auth/login?callbackUrl=${callbackUrl}`;
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // "PROCESSING" = masih diproses/retry boleh pakai key yang sama.
        // Selain itu percobaan ini selesai, key direset untuk attempt baru.
        if (data.code !== "PROCESSING") {
          idempotencyKeyRef.current = null;
        }

        setError(
          typeof data.message === "string"
            ? data.message
            : "Failed to create registration. Please try again.",
        );
        return;
      }

      if (typeof data.invoiceUrl === "string" && data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
        return;
      }

      idempotencyKeyRef.current = null;
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    if (submitting) return;
    setOpen(false);
    setSuccess(false);
    setError(null);
  }

  if (ended) {
    return (
      <button
        type="button"
        disabled
        className={buttonStyles({ size: "lg", className: "w-full" })}
      >
        Registration closed
      </button>
    );
  }

  if (soldOut) {
    return (
      <button
        type="button"
        disabled
        className={buttonStyles({ size: "lg", className: "w-full" })}
      >
        Sold out
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          idempotencyKeyRef.current = null;
          setOpen(true);
        }}
        className={buttonStyles({ size: "lg", className: "w-full" })}
      >
        {isFree ? "Register now" : `Register — ${priceFormatter.format(price)}`}
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {success ? "You're registered" : "Register for this event"}
                  </h2>
                  {!success && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {title}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <IoClose className="h-5 w-5" />
                </button>
              </div>

              {success ? (
                <div className="py-4 text-center">
                  <CheckCircle2 className="mx-auto text-green-600" size={56} />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Your {isFree ? "registration" : "payment"} is confirmed.
                    <br />
                    Your e-ticket has been sent to your email.
                  </p>
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard/my-ticket"
                      className={buttonStyles({ className: "mt-6 w-full" })}
                    >
                      View my tickets
                    </Link>
                  ) : (
                    <p className="mt-6 text-xs text-muted-foreground">
                      Keep that email, it contains your ticket and a link to
                      open it anytime.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {!isFree && (
                    <div className="mb-4 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3 text-sm">
                      <span className="text-muted-foreground">
                        Price per ticket
                      </span>
                      <span className="font-semibold text-foreground">
                        {priceFormatter.format(price)}
                      </span>
                    </div>
                  )}

                  <label className="mb-4 block">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                      Number of tickets
                    </span>
                    <select
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(Number(e.target.value))
                      }
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                    >
                      {Array.from({ length: maxTickets }, (_, i) => i + 1).map(
                        (n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  {isFree && !isAuthenticated && (
                    <div className="flex items-start gap-3 rounded-lg border border-secondary/20 bg-brand-lavender-100 p-3.5 mb-4">
                      <Mail
                        className="mt-0.5 size-4 shrink-0 text-secondary"
                        aria-hidden="true"
                      />

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          Important information
                        </p>
                        <p className="text-xs leading-relaxed text-foreground/80">
                          Your e-ticket and ticket code will be sent to this
                          email address. Please ensure your email is correct.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-5">
                    {attendees.map((attendee, index) => (
                      <fieldset
                        key={index}
                        className="space-y-3 rounded-lg border border-border p-4"
                      >
                        <legend className="px-1 text-xs font-semibold text-muted-foreground">
                          Attendee {index + 1}
                        </legend>

                        {fields.map((field) => (
                          <label key={field.key} className="block">
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                              {field.label}
                            </span>

                            {field.type === "SELECT" ? (
                              <select
                                value={attendee[field.key] ?? ""}
                                onChange={(e) =>
                                  updateAttendee(
                                    index,
                                    field.key,
                                    e.target.value,
                                  )
                                }
                                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                              >
                                <option value="">Select…</option>
                                {parseOptions(field.options).map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={
                                  field.type === "EMAIL"
                                    ? "email"
                                    : field.type === "PHONE"
                                      ? "tel"
                                      : field.type === "NUMBER"
                                        ? "number"
                                        : field.type === "DATE"
                                          ? "date"
                                          : "text"
                                }
                                value={attendee[field.key] ?? ""}
                                onChange={(e) =>
                                  updateAttendee(
                                    index,
                                    field.key,
                                    e.target.value,
                                  )
                                }
                                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                              />
                            )}
                          </label>
                        ))}
                      </fieldset>
                    ))}
                  </div>

                  {!isFree && (
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-base font-semibold text-foreground">
                        {priceFormatter.format(price * quantity)}
                      </span>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={buttonStyles({ className: "mt-5 w-full" })}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing…
                      </>
                    ) : isFree ? (
                      "Confirm registration"
                    ) : (
                      "Continue to payment"
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
