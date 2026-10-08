import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
} from "lucide-react";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

import {
  formatEventDateLong,
  formatEventTimeRange,
  hasEnded,
} from "../data/eventTime";

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

export default function EventDetailRail({
  event,
  now,
}: EventDetailRailProps) {
  const ended = hasEnded(event, now);
  const currentTime = new Date(now);
  const soldOut = !ended && event.soldOut;
  const remaining = !ended && event.remaining !== null
    ? Math.max(event.remaining, 0)
    : null;

  const location = event.location ??
    (event.format === "ONLINE" || event.format === "HYBRID"
      ? "Online"
      : null);

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
            timeZone={event.timeZone}
          />
          {location && (
            <MetaRow
              icon={location === "Online" ? Video : MapPin}
              label="Location"
              value={location}
            />
          )}
          <PriceRow
            label="Price"
            isFree={isFree}
            price={event.price}
          />
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

        {hasExternal && (
          <Link
            href={event.externalUrl as string}
            target="_blank"
            rel="noreferrer noopener"
            className={buttonStyles({ size: "lg", className: "w-full" })}
          >
            Register now
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
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
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
  timeZone,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  timeZone: string;
}) {
  const tzLabel: Record<string, string> = {
    "Asia/Jakarta": "WIB",
    "Asia/Makassar": "WITA",
    "Asia/Jayapura": "WIT",
  };
  const tzAbbr = tzLabel[timeZone] ?? timeZone;

  return (
    <div className="flex items-start gap-3 pt-4 first:pt-0">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">
          {value} {tzAbbr}
        </p>
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
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
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
