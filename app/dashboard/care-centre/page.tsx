import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils/FormatDate";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import ListingStatusBadge, {
  type ListingStatusValue,
} from "../components/listing/ListingStatusBadge";
import ListingStatusCard from "../components/listing/ListingStatusCard";
import ListingEmptyState from "../components/listing/ListingEmptyState";
import {
  DetailGrid,
  DetailRow,
  DetailStack,
  DetailStackRow,
  ListingSection,
} from "../components/listing/ListingSection";

export const metadata: Metadata = {
  title: "My care centre",
  description: "The status of your care centre listing in MindCare.id.",
};

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<string, string> = {
  KLINIK: "Klinik",
  RUMAH_SAKIT: "Rumah sakit",
  PUSKESMAS: "Puskesmas",
  PUSAT_KONSELING: "Pusat konseling",
};

const WEEKDAYS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

const TIME_ZONE_LABELS: Record<string, string> = {
  "Asia/Jakarta": "WIB — Jakarta",
  "Asia/Makassar": "WITA — Makassar",
  "Asia/Jayapura": "WIT — Jayapura",
};

const MEMBERSHIP_LABELS: Record<string, string> = {
  PENDING: "Awaiting approval",
  ACTIVE: "Active owner",
  DECLINED: "Declined",
};

export default async function DashboardCareCentrePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth?tab=login&callbackUrl=/dashboard/care-centre");
  }

  const userId = Number(session.user.id);
  const membership = await prisma.careCentreUser.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      centre: {
        include: {
          openingHours: { orderBy: { day: "asc" } },
          services: {
            include: { service: { select: { name: true } } },
            orderBy: { serviceId: "asc" },
          },
        },
      },
    },
  });

  const centre = membership?.centre ?? null;

  if (!centre || !membership) {
    return (
      <div className="mx-auto w-full max-w-5xl p-4 md:p-8">
        <ListingEmptyState entity="care-centre" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
          My care centre
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            {centre.name}
          </h1>
          <ListingStatusBadge
            status={centre.listingStatus as ListingStatusValue}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {KIND_LABELS[centre.kind] ?? centre.kind} · {centre.city},{" "}
          {centre.province}
        </p>
        <div className="pt-1">
          <Link
            href="/dashboard/care-centre/edit"
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit listing
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <ListingStatusCard
            status={centre.listingStatus as ListingStatusValue}
            submittedAt={centre.createdAt}
            checkedOn={centre.verificationCheckedOn}
            validUntil={centre.verificationValidUntil}
            note={centre.verificationNote}
          />

          {centre.description ? (
            <ListingSection title="About the centre">
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {centre.description}
              </p>
            </ListingSection>
          ) : null}

          <ListingSection title="Location & contact">
            <DetailGrid>
              <DetailRow
                label="Address"
                value={`${centre.street}, ${centre.city}, ${centre.province} ${centre.postalCode}`}
                className="sm:col-span-2"
              />
              <DetailRow label="Phone" value={centre.phone} />
              <DetailRow label="Website" value={centre.website ?? "—"} />
              <DetailRow
                label="BPJS"
                value={centre.acceptsBpjs ? "Accepted" : "Not accepted"}
              />
              <DetailRow
                label="Time zone"
                value={TIME_ZONE_LABELS[centre.timeZone] ?? centre.timeZone}
              />
            </DetailGrid>
          </ListingSection>

          <ListingSection
            title="Opening hours"
            description="Leave both times empty on days the centre is closed."
          >
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {centre.openingHours.map((hour) => (
                <div
                  key={hour.id}
                  className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0"
                >
                  <span className="text-sm text-foreground">
                    {WEEKDAYS[hour.day] ?? `Day ${hour.day}`}
                  </span>
                  <span
                    className={
                      hour.opens && hour.closes
                        ? "text-sm font-medium text-foreground"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {hour.opens && hour.closes
                      ? `${hour.opens} – ${hour.closes}`
                      : "Closed"}
                  </span>
                </div>
              ))}
            </div>
            {centre.openingNote ? (
              <p className="mt-3 text-xs text-muted-foreground">
                {centre.openingNote}
              </p>
            ) : null}
          </ListingSection>

          <ListingSection title="Services offered">
            {centre.services.length ? (
              <div className="flex flex-wrap gap-2">
                {centre.services.map((entry) => (
                  <span
                    key={entry.service.name}
                    className="rounded-md bg-brand-mint-100 px-2.5 py-1 text-xs font-medium text-accent"
                  >
                    {entry.service.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No services on record.
              </p>
            )}
          </ListingSection>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <ListingSection title="Verification">
            <DetailStack>
              <DetailStackRow
                label="Review"
                value={
                  centre.verificationReview.charAt(0) +
                  centre.verificationReview.slice(1).toLowerCase()
                }
              />
              <DetailStackRow
                label="Checked on"
                value={
                  centre.verificationCheckedOn
                    ? formatDate(centre.verificationCheckedOn)
                    : "—"
                }
              />
              <DetailStackRow
                label="Valid until"
                value={
                  centre.verificationValidUntil
                    ? formatDate(centre.verificationValidUntil)
                    : "—"
                }
              />
            </DetailStack>
          </ListingSection>

          <ListingSection
            title="Operating permit"
            description="Kept private — never shown on public pages."
          >
            <DetailStack>
              <DetailStackRow
                label="Type"
                value={centre.permitType ?? "—"}
              />
              <DetailStackRow
                label="Number"
                value={centre.permitNumber ?? "—"}
              />
              <DetailStackRow
                label="Valid until"
                value={
                  centre.permitValidUntil
                    ? formatDate(centre.permitValidUntil)
                    : "—"
                }
              />
            </DetailStack>
          </ListingSection>

          <ListingSection title="Your access">
            <DetailStack>
              <DetailStackRow label="Role" value="Owner" />
              <DetailStackRow
                label="Status"
                value={
                  MEMBERSHIP_LABELS[membership.status] ?? membership.status
                }
              />
            </DetailStack>
          </ListingSection>

          <section className="rounded-xl border border-border bg-brand-lavender-100 p-5">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Need to change something?
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Editing a listing after it is reviewed is not available yet.
              Contact us and we will update it for you.
            </p>
            <Link
              href="/help/verification-policy"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              How verification works
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
