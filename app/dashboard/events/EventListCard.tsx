import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  Video,
  Users,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { formatDate } from "@/lib/utils/FormatDate";

export type EventListCardData = {
  id: number;
  title: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  location: string | null;
  format: string;
  isPublished: boolean;
  price: number;
  quota: number | null;
  coverImage: string | null;
  registeredCount: number;
};

const FORMAT_LABELS: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "In person",
  HYBRID: "Hybrid",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function EventListCard({
  event,
  now,
}: {
  event: EventListCardData;
  now: number;
}) {
  const isOnline = event.format === "ONLINE";
  const ended = new Date(event.endDate).getTime() < now;
  const soldOut =
    event.quota !== null && event.registeredCount >= event.quota;

  const seatsLabel =
    event.quota !== null
      ? `${event.registeredCount}/${event.quota} registered`
      : `${event.registeredCount} registered`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover">
      <div className="relative h-40 w-full overflow-hidden bg-brand-lavender-100">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-brand-purple-600/50">
            <CalendarDays className="size-10" />
          </span>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {event.isPublished ? (
            <span className="rounded-md bg-brand-mint-100 px-2 py-0.5 text-xs font-medium text-accent">
              Live
            </span>
          ) : (
            <span className="rounded-md bg-brand-lavender-100 px-2 py-0.5 text-xs font-medium text-secondary">
              Draft
            </span>
          )}
          {soldOut ? (
            <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              Sold out
            </span>
          ) : null}
        </div>

        <span className="absolute right-3 top-3 rounded-md bg-card/90 px-2 py-0.5 text-xs font-semibold text-foreground backdrop-blur">
          {event.price > 0 ? formatPrice(event.price) : "Free"}
        </span>

        {ended ? (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/45">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-white">
              Ended
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 font-heading text-base font-semibold leading-snug text-foreground">
          {event.title}
        </h3>

        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0" />
            {formatDate(event.startDate)}
          </li>
          <li className="flex items-center gap-1.5">
            {isOnline ? (
              <Video className="size-3.5 shrink-0" />
            ) : (
              <MapPin className="size-3.5 shrink-0" />
            )}
            <span className="truncate">
              {isOnline
                ? "Online"
                : (event.location ??
                  FORMAT_LABELS[event.format] ??
                  event.format)}
            </span>
          </li>
          <li className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" />
            {seatsLabel}
          </li>
        </ul>

        <div className="mt-auto flex gap-2 pt-1">
          <Link
            href={`/dashboard/events/edit/${event.id}`}
            className={buttonStyles({
              variant: "outline",
              size: "sm",
              className: "flex-1",
            })}
          >
            <Pencil className="size-4" />
            Edit
          </Link>
          <Link
            href={`/events/${event.slug}`}
            className={buttonStyles({
              variant: "ghost",
              size: "sm",
              className: "flex-1",
            })}
          >
            <ExternalLink className="size-4" />
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
