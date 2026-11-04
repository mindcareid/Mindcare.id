import Link from "next/link";
import { CalendarDays, Clock, Handshake, MapPin, Video } from "lucide-react";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { cn } from "@/lib/utils";

import {
  formatEventDateLong,
  formatEventTimeRange,
  hasEnded,
} from "../data/eventTime";
import DownloadProposalButton from "./DownloadProposalButton";
import RegisterEventButton from "./RegisterEventButton";

import type { EventDetail } from "../data/events";

type EventDetailRailProps = {
  event: EventDetail;
  now: string;
};

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function EventDetailRail({ event, now }: EventDetailRailProps) {
  const ended = hasEnded(event, now);
  const soldOut = !ended && event.soldOut;
  const remaining =
    !ended && event.remaining !== null ? Math.max(event.remaining, 0) : null;

  const location =
    event.location ??
    (event.format === "ONLINE" || event.format === "HYBRID" ? "Online" : null);

  const isFree = event.price <= 0;
  const hasExternal = event.externalUrl;

  return (
    <div className="space-y-6">
      {/* kartu info utama */}
      <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-card">
        <dl className="space-y-4 divide-y divide-border">
          <DateRow
            icon={CalendarDays}
            label="Date"
            value={formatEventDateLong(event)}
          />
          <TimeRow
            icon={Clock}
            label="Time"
            value={formatEventTimeRange(event)}
          />
          {location && (
            <MetaRow
              icon={location === "Online" ? Video : MapPin}
              label="Location"
              value={location}
            />
          )}
          <PriceRow label="Price" isFree={isFree} price={event.price} />
          {!ended && remaining !== null && (
            <MetaRow
              icon={null}
              label="Availability"
              value={
                soldOut
                  ? "Sold out"
                  : `${remaining} of ${event.quota} remaining`
              }
            />
          )}
        </dl>

        {hasExternal ? (
          <Link
            href={event.externalUrl as string}
            target="_blank"
            rel="noreferrer noopener"
            className={buttonStyles({ size: "lg", className: "w-full" })}
          >
            Register now
          </Link>
        ) : (
          <RegisterEventButton
            eventId={event.id}
            title={event.title}
            price={event.price}
            remaining={remaining}
            soldOut={soldOut}
            ended={ended}
            attendeeFields={event.attendeeFields.map((field) => ({
              id: field.id,
              label: field.label,
              key: field.key,
              type: field.type,
              required: field.required,
              options: field.options,
            }))}
          />
        )}

        {event.canDownloadProposal && (
          <DownloadProposalButton
            eventId={event.id}
            eventTitle={event.title}
            eventName={event.title}
          />
        )}

        {/*
         * Pintu masuk "Apply as sponsor". Section Sponsorship ada jauh di
         * bawah halaman, jadi tanpa tombol di sini pengunjung tidak tahu
         * fiturnya ada. Gaya `outline` disengaja: `Register now` tetap aksi
         * utama, tombol ini alternatif, bukan pesaingnya.
         *
         * Hanya muncul kalau event belum berakhir DAN punya paket aktif —
         * tombol yang mengantar ke halaman "Sponsorship is not open" lebih
         * buruk daripada tidak ada tombol.
         */}
        {!ended && event.sponsorTiers.length > 0 && (
          <Link
            href={`/events/${event.slug}/sponsor`}
            className={cn(
              buttonStyles({ variant: "outline", size: "lg", className: "w-full" }),
              "justify-center",
            )}
          >
            <Handshake className="size-4" aria-hidden="true" />
            Apply as sponsor
          </Link>
        )}
      </div>

      {/* kategori */}
      <div className="space-y-2 rounded-xl border border-border bg-card p-6 shadow-card">
        <p className="text-xs text-muted-foreground">Category</p>
        <p className="text-sm font-medium text-foreground">
          {event.category.name}
        </p>
      </div>
    </div>
  );
}

function DateRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 pt-4 first:pt-0">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function TimeRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 pt-4 first:pt-0">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin | typeof Video | null;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 pt-4 first:pt-0">
      {Icon && (
        <Icon
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      )}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function PriceRow({
  label,
  isFree,
  price,
}: {
  label: string;
  isFree: boolean;
  price: number;
}) {
  return (
    <div className="flex items-start gap-3 pt-4 first:pt-0">
      <div className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">
          {isFree ? "Free" : priceFormatter.format(price)}
        </p>
      </div>
    </div>
  );
}
