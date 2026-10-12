import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Boxes,
  Stethoscope,
  CalendarPlus,
  ArrowRight,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import ProfileUserHeader from "./_section/ProfileHeader";
import ProfileUserOrder, {
  type ProfileOrderItem,
} from "./_section/ProfileOrder";
import ListingStatusBadge, {
  type ListingStatusValue,
} from "./components/listing/ListingStatusBadge";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth?tab=login&callbackUrl=/dashboard");
  }

  const userId = Number(session.user.id);

  const [professional, membership, solutions, orders] = await Promise.all([
    prisma.professional.findFirst({
      where: { userId, deletedAt: null },
      select: { fullName: true, listingStatus: true },
    }),
    prisma.careCentreUser.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        centre: {
          select: { name: true, listingStatus: true },
        },
      },
    }),
    prisma.solution.findMany({
      where: { ownerUserId: userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: { name: true, listingStatus: true },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
        event: { select: { title: true } },
        _count: { select: { tickets: true } },
      },
    }),
  ]);

  const orderItems: ProfileOrderItem[] = orders.map((order) => ({
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    createdAt: order.createdAt,
    ticketCount: order._count.tickets,
    event: { title: order.event.title },
  }));

  const centre = membership?.centre ?? null;
  const canHostEvents = Boolean(professional) || Boolean(centre);

  const listings = [
    {
      key: "professional",
      icon: Stethoscope,
      title: "Professional",
      name: professional?.fullName ?? null,
      status: professional?.listingStatus as ListingStatusValue | undefined,
      manageHref: "/dashboard/professional",
      applyHref: "/apply/professional",
      applyLabel: "Apply as a professional",
    },
    {
      key: "care-centre",
      icon: Building2,
      title: "Care centre",
      name: centre?.name ?? null,
      status: centre?.listingStatus as ListingStatusValue | undefined,
      manageHref: "/dashboard/care-centre",
      applyHref: "/apply/care-centre",
      applyLabel: "Register a centre",
    },
    {
      key: "solution",
      icon: Boxes,
      title: "Solutions",
      name:
        solutions.length === 0
          ? null
          : solutions.length === 1
            ? solutions[0].name
            : `${solutions.length} solutions`,
      status: solutions[0]?.listingStatus as ListingStatusValue | undefined,
      manageHref: "/dashboard/solution",
      applyHref: "/apply/solution",
      applyLabel: "List a solution",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <ProfileUserHeader user={session.user} />

      <section aria-labelledby="listings-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="listings-heading"
              className="font-heading text-lg font-semibold text-foreground"
            >
              Your listings
            </h2>
            <p className="text-sm text-muted-foreground">
              What visitors can find you for in the directory.
            </p>
          </div>
          {canHostEvents && (
            <Link
              href="/dashboard/events"
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              <CalendarPlus className="size-4" />
              My events
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const Icon = listing.icon;
            const isListed = Boolean(listing.name);

            return (
              <div
                key={listing.key}
                className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-brand-lavender-100 text-secondary">
                    <Icon className="size-5" />
                  </span>
                  {isListed && listing.status ? (
                    <ListingStatusBadge status={listing.status} />
                  ) : (
                    <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      Not listed
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-heading text-base font-semibold text-foreground">
                  {listing.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                  {listing.name ?? "No listing yet"}
                </p>

                <div className="mt-4 pt-1">
                  {isListed ? (
                    <Link
                      href={listing.manageHref}
                      className={buttonStyles({
                        variant: "outline",
                        size: "sm",
                        className: "w-full",
                      })}
                    >
                      Manage
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : (
                    <Link
                      href={listing.applyHref}
                      className={buttonStyles({
                        variant: "primary",
                        size: "sm",
                        className: "w-full",
                      })}
                    >
                      {listing.applyLabel}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <ProfileUserOrder orders={orderItems} />
    </div>
  );
}
