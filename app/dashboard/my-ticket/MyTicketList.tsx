"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Ticket as TicketIcon } from "lucide-react";
import { Ticket as PrismaTicket, OrderStatus } from "@prisma/client";

import { buttonStyles } from "@/app/components/reusable/buttonStyles";

interface TicketWithEvent extends PrismaTicket {
  order: {
    status: OrderStatus;
    event: {
      title: string;
      slug: string;
      startDate: Date;
      location?: string | null;
    };
  };
}

export default function MyTicketList({
  tickets,
}: {
  tickets: TicketWithEvent[];
}) {
  if (tickets.length === 0) {
    return <EmptyTickets />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          My tickets
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tickets.length} active {tickets.length === 1 ? "ticket" : "tickets"}.
          Show the QR code at the venue entrance.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: TicketWithEvent }) {
  const event = ticket.order.event;
  const date = new Date(event.startDate);

  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.toLocaleDateString("en-US", { day: "2-digit" });
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });

  return (
    <article className="flex overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-0.5 bg-brand-navy-700 px-2 py-5 text-center text-primary-foreground">
        <span className="text-xs font-medium uppercase tracking-wide">
          {month}
        </span>
        <span className="font-heading text-3xl font-semibold leading-none">
          {day}
        </span>
        <span className="text-xs text-primary-foreground/80">{weekday}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-heading text-base font-semibold leading-snug text-foreground sm:text-lg">
            {event.title}
          </h2>
          <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
            Paid
          </span>
        </div>

        {event.location && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{event.location}</span>
          </p>
        )}

        <div className="mt-4 flex items-end justify-between gap-4 border-t border-border pt-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {ticket.attendeeName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {ticket.attendeeEmail}
            </p>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Ticket code
            </p>
            <p className="text-sm font-semibold tracking-wide text-foreground">
              {ticket.code}
            </p>
          </div>

          {ticket.qrCode && (
            <Image
              src={ticket.qrCode.trim()}
              alt={`QR code for ${ticket.attendeeName}`}
              width={88}
              height={88}
              className="h-22 w-22 shrink-0 rounded-md border border-border"
              unoptimized
            />
          )}
        </div>

        <div className="mt-4">
          <Link
            href={`/events/${event.slug}`}
            className={buttonStyles({
              variant: "outline",
              size: "md",
              className: "min-h-11 w-full sm:w-auto",
            })}
          >
            View event
          </Link>
        </div>
      </div>
    </article>
  );
}

function EmptyTickets() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-lavender-100">
        <TicketIcon className="h-8 w-8 text-secondary" aria-hidden="true" />
      </div>

      <h2 className="mt-5 font-heading text-lg font-semibold text-foreground">
        No tickets yet
      </h2>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
        You have not registered for any event. Browse upcoming events to secure
        a seat.
      </p>

      <Link
        href="/events"
        className={buttonStyles({ size: "lg", className: "mt-6 min-h-11" })}
      >
        Browse events
      </Link>
    </div>
  );
}
