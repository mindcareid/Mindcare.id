"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Mail,
} from "lucide-react";
import { IoClose } from "react-icons/io5";

import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { useRecaptcha } from "@/app/hooks/useRecaptcha";
import { cn } from "@/lib/utils";

type DownloadProposalButtonProps = {
  eventId: number;
  eventTitle: string;
  eventName: string;
  className?: string;
};

type FormState = {
  eventName: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  position: string;
};

type FieldKey = keyof FormState;

const FIELDS: {
  key: FieldKey;
  label: string;
  required: boolean;
  type: "text" | "email" | "tel";
  autoComplete?: string;
  placeholder?: string;
  readOnly?: boolean;
}[] = [
  {
    key: "eventName",
    label: "Event name",
    required: true,
    type: "text",
    readOnly: true,
  },
  {
    key: "fullName",
    label: "Full name",
    required: true,
    type: "text",
    autoComplete: "name",
  },
  {
    key: "email",
    label: "Email",
    required: true,
    type: "email",
    autoComplete: "email",
    placeholder: "The proposal will be sent to this address",
  },
  {
    key: "phone",
    label: "Phone",
    required: true,
    type: "tel",
    autoComplete: "tel",
    placeholder: "+62…",
  },
  {
    key: "institution",
    label: "Institution",
    required: true,
    type: "text",
    autoComplete: "organization",
  },
  {
    key: "position",
    label: "Position",
    required: true,
    type: "text",
    autoComplete: "organization-title",
  },
];

export default function DownloadProposalButton({
  eventId,
  eventTitle,
  eventName,
  className,
}: DownloadProposalButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    eventName,
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    position: "",
  });

  const { enabled: captchaEnabled, execute: executeCaptcha } =
    useRecaptcha("proposal_download");

  function update(key: FieldKey, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function close() {
    if (submitting) return;
    setOpen(false);
    setError(null);
    setSentTo(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    for (const field of FIELDS) {
      // Field read-only terisi dari event, bukan diisi pengunjung.
      if (field.readOnly) continue;

      if (field.required && !form[field.key].trim()) {
        setError(`"${field.label}" is required.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const captchaToken = await executeCaptcha();

      const res = await fetch(`/api/events/${eventId}/proposal-download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          institution: form.institution.trim(),
          position: form.position.trim(),
          captchaToken,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        code?: string;
        message?: string;
        errors?: Record<string, string[] | undefined>;
      };

      if (!res.ok) {
        const firstFieldError = data.errors
          ? Object.values(data.errors).find((list) => list && list.length > 0)
          : undefined;

        setError(
          firstFieldError?.[0] ??
            data.message ??
            "Could not send the proposal. Please try again.",
        );
        return;
      }

      setSentTo(form.email.trim());
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          buttonStyles({ variant: "outline", size: "lg", className: "w-full" }),
          className,
        )}
      >
        <Download className="size-4" aria-hidden="true" />
        Download proposal
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="proposal-dialog-title"
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="proposal-dialog-title"
                    className="text-lg font-semibold text-foreground"
                  >
                    {sentTo ? "Proposal sent" : "Download event proposal"}
                  </h2>
                  {!sentTo && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {eventTitle}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <IoClose className="h-5 w-5" />
                </button>
              </div>

              {sentTo ? (
                <div className="py-4 text-center">
                  <CheckCircle2 className="mx-auto text-green-600" size={56} />
                  <p className="mt-4 text-sm text-muted-foreground">
                    The proposal for <strong>{eventTitle}</strong> has been
                    emailed to <strong>{sentTo}</strong> as a PDF attachment.
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Check your inbox in a few minutes. If you don&apos;t see it,
                    look in your spam folder.
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className={buttonStyles({ className: "mt-6 w-full" })}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="mb-1 flex items-start gap-3 rounded-lg border border-secondary/20 bg-brand-lavender-100 p-3.5">
                    <Mail
                      className="mt-0.5 size-4 shrink-0 text-secondary"
                      aria-hidden="true"
                    />
                    <p className="text-xs leading-relaxed text-foreground/80">
                      Fill in the form below and the proposal PDF will be sent
                      straight to your email as an attachment. No account
                      needed.
                    </p>
                  </div>

                  {FIELDS.map((field) => (
                    <label key={field.key} className="block">
                      <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        {field.label}
                        {field.readOnly ? (
                          <span className="ml-1 text-muted-foreground/70">
                            (from this event)
                          </span>
                        ) : field.required ? (
                          <span className="text-destructive"> *</span>
                        ) : (
                          <span className="ml-1 text-muted-foreground/70">
                            (optional)
                          </span>
                        )}
                      </span>
                      <input
                        type={field.type}
                        value={form[field.key]}
                        onChange={(e) => update(field.key, e.target.value)}
                        required={field.required}
                        autoComplete={field.autoComplete}
                        placeholder={field.placeholder}
                        readOnly={field.readOnly}
                        aria-readonly={field.readOnly || undefined}
                        tabIndex={field.readOnly ? -1 : undefined}
                        title={
                          field.readOnly
                            ? "This is the event you are viewing"
                            : undefined
                        }
                        className={cn(
                          "w-full rounded-md border border-border px-3 py-2 text-sm",
                          field.readOnly
                            ? "cursor-not-allowed bg-muted text-muted-foreground"
                            : "bg-card text-foreground",
                        )}
                      />
                    </label>
                  ))}

                  {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className={buttonStyles({ className: "mt-2 w-full" })}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Email me the proposal"
                    )}
                  </button>
                  {captchaEnabled && (
                    <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                      This site is protected by reCAPTCHA and the Google{" "}
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline"
                      >
                        Privacy Policy
                      </a>{" "}
                      and{" "}
                      <a
                        href="https://policies.google.com/terms"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline"
                      >
                        Terms of Service
                      </a>{" "}
                      apply.
                    </p>
                  )}
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
