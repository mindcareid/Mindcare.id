import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils/FormatDate";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import ListingStatusCard from "../components/listing/ListingStatusCard";
import ListingEmptyState from "../components/listing/ListingEmptyState";
import ListingHero from "../components/listing/ListingHero";
import type { ListingStatusValue } from "../components/listing/ListingStatusBadge";
import {
  DetailGrid,
  DetailRow,
  DetailStack,
  DetailStackRow,
  ListingSection,
} from "../components/listing/ListingSection";

export const metadata: Metadata = {
  title: "My solution",
  description: "The solution your account has listed in MindCare.id.",
};

export const dynamic = "force-dynamic";

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default async function DashboardSolutionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth?tab=login&callbackUrl=/dashboard/solution");
  }

  const solution = await prisma.solution.findUnique({
    where: { ownerUserId: Number(session.user.id) },
    select: {
      id: true,
      name: true,
      slug: true,
      organizationName: true,
      tagline: true,
      description: true,
      logo: true,
      website: true,
      contactEmail: true,
      contactPhone: true,
      listingStatus: true,
      verificationReview: true,
      verificationCheckedOn: true,
      verificationValidUntil: true,
      verificationNote: true,
      isFeatured: true,
      createdAt: true,
      deletedAt: true,
      category: { select: { name: true } },
    },
  });

  if (!solution || solution.deletedAt) {
    return (
      <div className="mx-auto w-full max-w-5xl p-4 md:p-8">
        <ListingEmptyState entity="solution" />
      </div>
    );
  }

  const isListed = solution.listingStatus === "LISTED";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <ListingHero
        eyebrow="My solution"
        name={solution.name}
        imageUrl={solution.logo}
        imageAlt={solution.name}
        status={solution.listingStatus as ListingStatusValue}
        meta={`${solution.organizationName} · ${solution.category.name}`}
        editHref={`/dashboard/solution/${solution.id}/edit`}
        stats={[
          { label: "Category", value: solution.category.name },
          { label: "Submitted", value: formatDate(solution.createdAt) },
          {
            label: "Review",
            value: titleCase(solution.verificationReview),
          },
          {
            label: "Valid until",
            value: solution.verificationValidUntil
              ? formatDate(solution.verificationValidUntil)
              : "—",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <ListingStatusCard
            status={solution.listingStatus as ListingStatusValue}
            submittedAt={solution.createdAt}
            checkedOn={solution.verificationCheckedOn}
            validUntil={solution.verificationValidUntil}
            note={solution.verificationNote}
          />

          {solution.tagline || solution.description ? (
            <ListingSection
              title="About the solution"
              description="How it is introduced in the directory."
              icon={<Boxes className="size-5" />}
            >
              {solution.tagline ? (
                <p className="text-sm font-medium text-foreground">
                  {solution.tagline}
                </p>
              ) : null}
              {solution.description ? (
                <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                  {solution.description}
                </p>
              ) : null}
            </ListingSection>
          ) : null}

          <ListingSection
            title="Listing details"
            icon={<ClipboardList className="size-5" />}
          >
            <DetailGrid>
              <DetailRow
                label="Organization"
                value={solution.organizationName}
              />
              <DetailRow label="Category" value={solution.category.name} />
              <DetailRow label="Website" value={solution.website ?? "—"} />
              <DetailRow
                label="Contact email"
                value={solution.contactEmail ?? "—"}
              />
              <DetailRow
                label="Contact phone"
                value={solution.contactPhone ?? "—"}
              />
              <DetailRow
                label="Featured"
                value={solution.isFeatured ? "Yes" : "No"}
              />
            </DetailGrid>
          </ListingSection>

          <ListingSection
            title="Public page"
            description={
              isListed
                ? "This is what visitors see when they open your solution."
                : "Your public page becomes available once the listing is approved."
            }
            icon={<ExternalLink className="size-5" />}
          >
            {isListed ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm text-muted-foreground">
                  /solutions/{solution.slug}
                </p>
                <Link
                  href={`/solutions/${solution.slug}`}
                  className={buttonStyles({ variant: "primary", size: "md" })}
                >
                  <ExternalLink className="size-4" />
                  View public page
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing is public yet. We will let you know once it is live.
              </p>
            )}
          </ListingSection>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <ListingSection
            title="Verification"
            icon={<ShieldCheck className="size-5" />}
          >
            <DetailStack>
              <DetailStackRow
                label="Review"
                value={titleCase(solution.verificationReview)}
              />
              <DetailStackRow
                label="Checked on"
                value={
                  solution.verificationCheckedOn
                    ? formatDate(solution.verificationCheckedOn)
                    : "—"
                }
              />
              <DetailStackRow
                label="Valid until"
                value={
                  solution.verificationValidUntil
                    ? formatDate(solution.verificationValidUntil)
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
