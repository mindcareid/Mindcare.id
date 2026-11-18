import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Container from "@/app/components/reusable/Container";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import prisma from "@/lib/prisma";
import {
  getPublicSponsorTiers,
  normalizeBenefits,
} from "@/lib/sponsors/queries";
import SponsorForm from "./components/SponsorForm";

export const metadata: Metadata = {
  title: "Sponsorship request",
  description: "Apply as a sponsor for this MindCare.id event.",
  robots: { index: false, follow: false },
};

// Halaman ini membaca jam (event yang sudah berakhir) dan paket aktif.
export const dynamic = "force-dynamic";

export default async function SponsorPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { tier?: string };
}) {
  const now = new Date();
  const event = await prisma.event.findFirst({
    where: {
      slug: params.slug,
      publisherType: "PLATFORM",
      status: "PUBLISHED",
      deletedAt: null,
      endDate: { gt: now },
    },
    select: { id: true, title: true, slug: true },
  });
  const eventWithoutWindow = event
    ? null
    : await prisma.event.findFirst({
        where: {
          slug: params.slug,
          publisherType: "PLATFORM",
          status: "PUBLISHED",
          deletedAt: null,
        },
        select: { id: true, title: true, slug: true, endDate: true },
      });

  if (!event && !eventWithoutWindow) notFound();

  const publicTiers = event ? await getPublicSponsorTiers(event.id) : [];
  const ended = !event && Boolean(eventWithoutWindow);

  if (!event || publicTiers.length === 0) {
    return (
      <Container className="py-16 md:py-24">
        <div className="mx-auto w-full max-w-2xl space-y-6 rounded-xl border border-border bg-card p-8 shadow-card">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Sponsorship is not open
          </h1>
          <p className="text-sm text-muted-foreground">
            {ended
              ? "This event has already ended, so we are no longer accepting sponsorship requests for it."
              : "This event does not have sponsorship packages at the moment."}
          </p>
          <Link
            href={`/events/${params.slug}`}
            className={buttonStyles({ variant: "outline" })}
          >
            Back to the event
          </Link>
        </div>
      </Container>
    );
  }

  const countries = await prisma.country.findMany({
    select: { code: true, name: true, callingCode: true },
    orderBy: { name: "asc" },
  });

  const tiers = publicTiers.map((tier) => ({
    id: tier.id,
    name: tier.name,
    priceAmount: tier.priceAmount,
    currency: tier.currency,
    displayUsd: tier.displayUsd,
    benefits: normalizeBenefits(tier.benefits),
  }));

  const requested = Number(searchParams?.tier);
  const preselected = tiers.some((tier) => tier.id === requested)
    ? requested
    : null;

  return (
    <Container className="py-10 md:py-14">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
            Sponsorship
          </p>
          <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
            Apply as a sponsor
          </h1>
          <p className="text-base text-muted-foreground">{event.title}</p>
        </header>

        <SponsorForm
          eventId={event.id}
          eventSlug={event.slug}
          tiers={tiers}
          preselectedTierId={preselected}
          countries={countries.map((country) => ({
            code: country.code,
            name: country.name,
            // Dipakai form untuk mengenali negara dari nomor yang sudah diketik
            // saat "Different country" ditekan — tanpa menebak batas digit.
            callingCode: country.callingCode,
          }))}
        />
      </div>
    </Container>
  );
}
