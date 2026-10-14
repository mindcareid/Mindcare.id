"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Mail, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/app/components/reusable/Button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/FormatDate";

type Contact = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  subject: string;
  message: string;
  status: "UNREAD" | "READ" | "REPLIED";
  createdAt: string;
  repliedAt: string | null;
};

const STATUS_BADGE: Record<Contact["status"], string> = {
  UNREAD: "bg-destructive/10 text-destructive",
  READ: "bg-brand-lavender-100 text-secondary",
  REPLIED: "bg-brand-mint-100 text-accent",
};

export default function ContactDetailAdmin() {
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;

    fetch(`/api/cadmin/contacts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setContact(json.data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load message");
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleMarkReplied = async () => {
    setMarking(true);
    try {
      const res = await fetch(`/api/cadmin/contacts/${id}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error();
      setContact((prev) =>
        prev
          ? { ...prev, status: "REPLIED", repliedAt: new Date().toISOString() }
          : prev,
      );
      toast.success("Marked as replied");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setMarking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/cadmin/contacts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Message deleted");
      router.push("/cadmin/contactemail");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  if (!loaded) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-4 py-8 sm:p-6 lg:p-8">
        <div className="h-6 w-32 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted/40" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted/40" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center text-sm text-muted-foreground">
        Message not found.{" "}
        <Link href="/cadmin/contactemail" className="text-primary hover:underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 py-8 sm:p-6 lg:p-8">
      {/* Back */}
      <Link
        href="/cadmin/contactemail"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Messages
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-xl font-semibold text-foreground">
                {contact.name}
              </h1>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  STATUS_BADGE[contact.status],
                )}
              >
                {contact.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(contact.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {contact.status !== "REPLIED" && (
              <Button
                variant="accent"
                size="sm"
                icon={Check}
                isLoading={marking}
                onClick={handleMarkReplied}
              >
                Mark as Replied
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-lavender-100 text-secondary">
              <Mail className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="truncate text-sm font-medium text-foreground">
                {contact.email}
              </p>
            </div>
          </a>

          {contact.phoneNumber && (
            <a
              href={`tel:${contact.phoneNumber}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-mint-100 text-accent">
                <Phone className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="truncate text-sm font-medium text-foreground">
                  {contact.phoneNumber}
                </p>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
            Subject
          </p>
          <p className="font-medium text-foreground">{contact.subject}</p>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
            Message
          </p>
          <div className="whitespace-pre-line rounded-xl bg-background p-4 text-sm leading-relaxed text-foreground">
            {contact.message}
          </div>
        </div>
      </div>

      {/* Replied */}
      {contact.status === "REPLIED" && contact.repliedAt && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-brand-mint-100 px-4 py-3 text-sm text-accent">
          <Check className="h-4 w-4" />
          Marked as replied on {formatDate(contact.repliedAt)}
        </div>
      )}

      {/* Hint */}
      {contact.status !== "REPLIED" && (
        <div className="rounded-xl border border-border bg-brand-lavender-100 px-4 py-3 text-sm text-secondary">
          To reply, reply to the notification email — it goes straight to{" "}
          <strong>{contact.email}</strong>. After replying, click{" "}
          <strong>Mark as Replied</strong> above.
        </div>
      )}
    </div>
  );
}
