import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils/FormatCurrency";
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
  title: "My professional listing",
  description: "The status of your professional listing in MindCare.id.",
};

export const dynamic = "force-dynamic";

const PROFESSION_LABELS: Record<string, string> = {
  PSIKOLOG: "Psikolog",
  PSIKIATER: "Psikiater",
  KONSELOR: "Konselor",
};

const MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "In person",
};

export default async function DashboardProfessionalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth?tab=login&callbackUrl=/dashboard/professional");
  }

  const professional = await prisma.professional.findUnique({
    where: { userId: Number(session.user.id) },
    include: {
      services: { orderBy: { priceIdr: "asc" } },
      areas: { include: { area: { select: { name: true } } } },
    },
  });

  if (!professional) {
    return (
      <div className="mx-auto w-full max-w-5xl p-4 md:p-8">
        <ListingEmptyState entity="professional" />
      </div>
    );
  }

  const languages = Array.isArray(professional.languages)
    ? (professional.languages as string[])
    : [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
          My professional listing
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            {professional.fullName}
          </h1>
          <ListingStatusBadge
            status={professional.listingStatus as ListingStatusValue}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {professional.credentials} ·{" "}
          {PROFESSION_LABELS[professional.profession] ??
            professional.profession}{" "}
          · {professional.baseCity}, {professional.baseProvince}
        </p>
        <div className="pt-1">
          <Link
            href="/dashboard/professional/edit"
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
            status={professional.listingStatus as ListingStatusValue}
            submittedAt={professional.createdAt}
            checkedOn={professional.verificationCheckedOn}
            validUntil={professional.verificationValidUntil}
            note={professional.verificationNote}
          />

          <ListingSection
            title="About you"
            description="How you are introduced in the directory."
          >
            <p className="text-sm font-medium text-foreground">
              {professional.headline}
            </p>
            {professional.bio ? (
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                {professional.bio}
              </p>
            ) : null}
          </ListingSection>

          <ListingSection title="Practice details">
            <DetailGrid>
              <DetailRow
                label="Profession"
                value={
                  PROFESSION_LABELS[professional.profession] ??
                  professional.profession
                }
              />
              <DetailRow
                label="Experience"
                value={`${professional.yearsOfExperience} years`}
              />
              <DetailRow
                label="Languages"
                value={languages.length ? languages.join(", ") : "—"}
              />
              <DetailRow label="City" value={professional.baseCity} />
              <DetailRow label="Province" value={professional.baseProvince} />
              <DetailRow
                label="Starting price"
                value={
                  professional.startingPriceIdr !== null
                    ? formatCurrency(professional.startingPriceIdr)
                    : "—"
                }
              />
            </DetailGrid>
          </ListingSection>

          <ListingSection
            title="Areas of support"
            description="The concerns visitors can come to you for."
          >
            {professional.areas.length ? (
              <div className="flex flex-wrap gap-2">
                {professional.areas.map((entry) => (
                  <span
                    key={entry.area.name}
                    className="rounded-md bg-brand-lavender-100 px-2.5 py-1 text-xs font-medium text-secondary"
                  >
                    {entry.area.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No areas of support on record.
              </p>
            )}
          </ListingSection>

          <ListingSection
            title="Sessions & pricing"
            description="The lowest price becomes the “from” price on your card."
          >
            {professional.services.length ? (
              <ul className="divide-y divide-border">
                {professional.services.map((service) => (
                  <li
                    key={service.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {service.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {MODE_LABELS[service.mode] ?? service.mode} ·{" "}
                        {service.durationMinutes} minutes
                      </p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrency(service.priceIdr)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No sessions on record.
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
                  professional.verificationReview.charAt(0) +
                  professional.verificationReview.slice(1).toLowerCase()
                }
              />
              <DetailStackRow
                label="Checked on"
                value={
                  professional.verificationCheckedOn
                    ? formatDate(professional.verificationCheckedOn)
                    : "—"
                }
              />
              <DetailStackRow
                label="Valid until"
                value={
                  professional.verificationValidUntil
                    ? formatDate(professional.verificationValidUntil)
                    : "—"
                }
              />
            </DetailStack>
          </ListingSection>

          <ListingSection
            title="Licence on record"
            description="Kept private — never shown on public pages."
          >
            <DetailStack>
              <DetailStackRow
                label="Type"
                value={professional.licenceType ?? "—"}
              />
              <DetailStackRow
                label="Number"
                value={professional.licenceNumber ?? "—"}
              />
              <DetailStackRow
                label="Valid until"
                value={
                  professional.licenceValidUntil
                    ? formatDate(professional.licenceValidUntil)
                    : "—"
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
