"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
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

const FILTERS = ["ALL", "UNREAD", "READ", "REPLIED"] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_BADGE: Record<Contact["status"], string> = {
  UNREAD: "bg-destructive/10 text-destructive",
  READ: "bg-brand-lavender-100 text-secondary",
  REPLIED: "bg-brand-mint-100 text-accent",
};

export default function ContactEmailAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadedFilter, setLoadedFilter] = useState<Filter | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");

  const loading = loadedFilter !== filter;
  const unreadCount = contacts.filter((c) => c.status === "UNREAD").length;

  useEffect(() => {
    let cancelled = false;
    const url =
      filter === "ALL"
        ? "/api/cadmin/contacts"
        : `/api/cadmin/contacts?status=${filter}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setContacts(json.data ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load messages");
      })
      .finally(() => {
        if (!cancelled) setLoadedFilter(filter);
      });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Contact Messages
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage incoming messages from the contact form.
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            aria-pressed={filter === tab}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              filter === tab
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          No messages found.
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => {
            const unread = contact.status === "UNREAD";
            return (
              <Link
                key={contact.id}
                href={`/cadmin/contactemail/${contact.id}`}
                className="group flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition hover:shadow-card-hover"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mt-1.5 size-2.5 shrink-0 rounded-full",
                      unread ? "bg-destructive" : "bg-border",
                    )}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          "text-foreground",
                          unread ? "font-semibold" : "font-medium",
                        )}
                      >
                        {contact.name}
                      </p>
                      <span className="truncate text-xs text-muted-foreground">
                        {contact.email}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {contact.subject}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(contact.createdAt)}
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                    STATUS_BADGE[contact.status],
                  )}
                >
                  {contact.status}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
