import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Plus, Pencil, ExternalLink, Calendar, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils/FormatDate";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

export const metadata: Metadata = {
  title: "My events",
  description: "Events created by your listings.",
};

export const dynamic = "force-dynamic";

const FORMAT_LABELS: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "In Person",
  HYBRID: "Hybrid",
};

export default async function DashboardEventsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth?tab=login&callbackUrl=/dashboard/events");
  }
  const userId = Number(session.user.id);

  const [professional, membership, solutions] = await Promise.all([
    prisma.professional.findFirst({
      where: { userId, listingStatus: "LISTED", deletedAt: null },
      select: { id: true, slug: true, fullName: true },
    }),
    prisma.careCentreUser.findFirst({
      where: { userId, status: "ACTIVE" },
      select: {
        centre: { select: { id: true, slug: true, name: true } },
      },
    }),
    prisma.solution.findMany({
      where: { ownerUserId: userId, listingStatus: "LISTED", deletedAt: null },
      select: { id: true, slug: true, name: true },
    }),
  ]);

  const listingGroups: {
    label: string;
    type: "professional" | "care-centre" | "solution";
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
  for (const sol of solutions)
    listingGroups.push({ label: sol.name, type: "solution", id: sol.id });

  if (listingGroups.length === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          My events
        </h1>
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          You need an approved listing (professional, care centre, or solution)
          to create events.
        </div>
      </div>
    );
  }

  // Event per listing
  interface EventRow {
    id: number;
    title: string;
    slug: string;
    startDate: Date;
    location: string | null;
    format: string;
    isPublished: boolean;
    price: number;
  }

  type EventMap = Record<number, EventRow[]>;
  const events: EventMap = {};
  for (const group of listingGroups) {
    const where = (() => {
      if (group.type === "professional") return { professionalId: group.id };
      if (group.type === "care-centre") return { careCentreId: group.id };
      return { solutionId: group.id };
    })();

    const rows = await prisma.event.findMany({
      where: { ...where, deletedAt: null },
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        startDate: true,
        location: true,
        format: true,
        isPublished: true,
        price: true,
      },
    });
    events[group.id] = rows;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            My events
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Events from your listed profiles appear here. They go live right
            away — no separate review needed.
          </p>
        </div>
      </header>

      {listingGroups.map((group) => {
        const groupEvents = events[group.id] ?? [];
        return (
          <div key={`${group.type}-${group.id}`} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                {group.type === "professional"
                  ? "Professional"
                  : group.type === "care-centre"
                    ? "Care centre"
                    : "Solution"}
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  — {group.label}
                </span>
              </h2>
              <Link
                href={`/dashboard/events/create?type=${group.type}&id=${group.id}`}
                className={buttonStyles({ size: "sm" })}
              >
                <Plus className="h-3.5 w-3.5" />
                Create event
              </Link>
            </div>

            {groupEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet.</p>
            ) : (
              <div className="space-y-3">
                {groupEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">
                          {event.title}
                        </p>
                        {event.isPublished ? (
                          <span className="rounded-md bg-brand-mint-100 px-2 py-0.5 text-xs font-medium text-accent">
                            Live
                          </span>
                        ) : (
                          <span className="rounded-md bg-brand-lavender-100 px-2 py-0.5 text-xs font-medium text-secondary">
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.startDate)}
                        </span>
                        {event.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                        <span>
                          {FORMAT_LABELS[event.format] ?? event.format}
                        </span>
                        {event.price > 0 && (
                          <span>
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            }).format(event.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/events/edit/${event.id}`}
                        className={buttonStyles({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <Link
                        href={`/events/${event.slug}`}
                        className={buttonStyles({
                          variant: "ghost",
                          size: "sm",
                        })}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
