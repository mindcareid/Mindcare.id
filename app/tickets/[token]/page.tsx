import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, Clock, MapPin, Ticket as TicketIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { verifyTicketToken } from "@/lib/tickets/token";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your ticket | MindCare.id",
  robots: { index: false, follow: false },
};

function dateLabel(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(date);
}

function timeRangeLabel(start: Date, end: Date, timeZone: string): string {
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });

  return `${time.format(start)} - ${time.format(end)}`;
}

export default async function TicketPage({
  params,
}: {
  params: { token: string };
}) {
  const ticketId = verifyTicketToken(params.token);

  if (!ticketId) {
    notFound();
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { order: { include: { event: true } } },
  });

  if (!ticket || ticket.order.status !== "PAID") {
    notFound();
  }

  const event = ticket.order.event;
  const timeZone = event.timeZone || "Asia/Jakarta";

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center gap-2 border-b border-border px-6 py-5">
          <TicketIcon className="h-5 w-5 text-secondary" aria-hidden="true" />
          <h1 className="font-heading text-lg font-semibold text-foreground">
            Your e-ticket
          </h1>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Event
            </p>
            <p className="mt-1 font-heading text-xl font-semibold text-foreground">
              {event.title}
            </p>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex items-start gap-2.5">
              <CalendarDays
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-foreground">
                {dateLabel(event.startDate, timeZone)}
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-foreground">
                {timeRangeLabel(event.startDate, event.endDate, timeZone)}
              </span>
            </div>

            {event.location && (
              <div className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-foreground">{event.location}</span>
              </div>
            )}
          </dl>

          <div className="flex items-end justify-between gap-4 border-t border-border pt-5">
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
                width={104}
                height={104}
                className="h-26 w-26 shrink-0 rounded-md border border-border"
                unoptimized
              />
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Show this QR code at the venue entrance for check-in.
          </p>

          <Link
            href={`/events/${event.slug}`}
            className={buttonStyles({
              variant: "outline",
              size: "md",
              className: "min-h-11 w-full",
            })}
          >
            View event
          </Link>
        </div>
      </div>
    </main>
  );
}
