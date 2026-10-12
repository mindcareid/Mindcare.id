import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  Plus,
  CalendarDays,
  Clock,
  Radio,
  FileText,
  Stethoscope,
  Building2,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import EventListCard, {
  type EventListCardData,
} from "./EventListCard";

export const metadata: Metadata = {
  title: "My events",
  description: "Events created by your listings.",
};

export const dynamic = "force-dynamic";

function currentTimeMs() {
  return new Date().getTime();
}

export default async function DashboardEventsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth?tab=login&callbackUrl=/dashboard/events");
  }
  const userId = Number(session.user.id);

  const [professional, membership] = await Promise.all([
    prisma.professional.findFirst({
      where: { userId, listingStatus: "LISTED", deletedAt: null },
      select: { id: true, fullName: true },
    }),
    prisma.careCentreUser.findFirst({
      where: { userId, status: "ACTIVE" },
      select: { centre: { select: { id: true, name: true } } },
    }),
  ]);

  const listingGroups: {
    label: string;
    type: "professional" | "care-centre";
    id: number;
  }[] = [];
  if (professional)
    listingGroups.push({
      label: professional.fullName,
      type: "professional",
      id: professional.id,
    });
  if (membership?.centre)
    listingGroups.push({
      label: membership.centre.name,
      type: "care-centre",
      id: membership.centre.id,
    });

  if (listingGroups.length === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          My events
        </h1>
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          You need an approved listing (professional or care centre) to create
          events. Solutions cannot host events.
        </div>
      </div>
    );
  }

  const groupEvents: {
    group: (typeof listingGroups)[number];
    events: EventListCardData[];
  }[] = [];

  for (const group of listingGroups) {
    const where =
      group.type === "professional"
        ? { professionalId: group.id }
        : { careCentreId: group.id };

    const rows = await prisma.event.findMany({
      where: { ...where, deletedAt: null },
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        startDate: true,
        endDate: true,
        location: true,
        format: true,
        isPublished: true,
        price: true,
        quota: true,
        coverImage: true,
        _count: { select: { orders: { where: { status: "PAID" } } } },
      },
    });

    groupEvents.push({
      group,
      events: rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        startDate: row.startDate,
        endDate: row.endDate,
        location: row.location,
        format: row.format,
        isPublished: row.isPublished,
        price: row.price,
        quota: row.quota,
        coverImage: row.coverImage,
        registeredCount: row._count.orders,
      })),
    });
  }

  const all = groupEvents.flatMap((entry) => entry.events);
  const now = currentTimeMs();
  const stats = [
    { label: "All events", value: all.length, icon: CalendarDays },
    {
      label: "Live",
      value: all.filter((event) => event.isPublished).length,
      icon: Radio,
    },
    {
      label: "Drafts",
      value: all.filter((event) => !event.isPublished).length,
      icon: FileText,
    },
    {
      label: "Upcoming",
      value: all.filter((event) => new Date(event.endDate).getTime() >= now)
        .length,
      icon: Clock,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
      <header>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          My events
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Events from your listed profiles appear here. They go live right away
          — no separate review needed.
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4 shadow-card"
            >
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="size-4" />
                {stat.label}
              </dt>
              <dd className="mt-2 font-heading text-2xl font-semibold text-foreground">
                {stat.value}
              </dd>
            </div>
          );
        })}
      </dl>

      {groupEvents.map(({ group, events }) => {
        const TypeIcon =
          group.type === "professional" ? Stethoscope : Building2;
        return (
          <section
            key={`${group.type}-${group.id}`}
            className="space-y-4"
            aria-labelledby={`group-${group.type}-${group.id}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-lavender-100 text-secondary">
                  <TypeIcon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {group.type === "professional"
                      ? "Professional"
                      : "Care centre"}
                  </p>
                  <h2
                    id={`group-${group.type}-${group.id}`}
                    className="truncate font-heading text-lg font-semibold text-foreground"
                  >
                    {group.label}
                  </h2>
                </div>
              </div>
              <Link
                href={`/dashboard/events/create?type=${group.type}&id=${group.id}`}
                className={buttonStyles({ size: "md" })}
              >
                <Plus className="size-4" />
                Create event
              </Link>
            </div>

            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-10 text-center">
                <CalendarDays className="size-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  No events yet. Create your first one above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {events.map((event) => (
                  <EventListCard key={event.id} event={event} now={now} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
