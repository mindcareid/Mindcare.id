import Link from "next/link";
import { ArrowRight } from "lucide-react";

import SectionHeader from "@/app/components/reusable/SectionHeader";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { cn } from "@/lib/utils";
import { priceLines } from "@/lib/sponsors/money";
import type { SponsorBenefit } from "@/lib/sponsors/shared";

/*
 * ============================================================
 * SECTION SPONSORSHIP (ringkas, paling bawah halaman event)
 * ============================================================
 *
 * Section ini sengaja TIDAK memajang daftar benefit lengkap tiap paket.
 * Halaman event sudah panjang (agenda, speaker, host), dan daftar benefit
 * per paket membuatnya terasa seperti halaman penjualan. Yang dibutuhkan
 * pembaca di sini hanya dua hal: paket apa saja yang ada dan berapa harganya.
 * Isi lengkap ada di halaman form, tempat orang memang sudah memutuskan untuk
 * mengajukan.
 *
 * Karena itu pula tombolnya SATU untuk seluruh section, bukan satu per kartu:
 * mengarahkan ke halaman form yang menampilkan semua paket. Nama paket sendiri
 * menaut ke form dengan paket tersebut sudah terpilih.
 */

export type SponsorTierCard = {
  id: number;
  name: string;
  priceAmount: number;
  currency: string;
  displayUsd: number | null;
  benefits: SponsorBenefit[];
};

export default function EventSponsorship({
  eventSlug,
  tiers,
}: {
  eventSlug: string;
  tiers: SponsorTierCard[];
}) {
  if (tiers.length === 0) return null;

  // Harga terendah untuk kalimat pembuka ("from IDR ...").
  const cheapest = tiers.reduce((lowest, tier) =>
    tier.priceAmount < lowest.priceAmount ? tier : lowest,
  );
  const from = priceLines({
    amount: cheapest.priceAmount,
    currency: cheapest.currency,
    displayUsd: cheapest.displayUsd,
  });

  return (
    <div>
      <SectionHeader
        title="Sponsorship"
        description={`${tiers.length} package${
          tiers.length > 1 ? "s" : ""
        } available, from ${from.primary}.`}
        underline
      />

      <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
        {tiers.map((tier) => {
          const price = priceLines({
            amount: tier.priceAmount,
            currency: tier.currency,
            displayUsd: tier.displayUsd,
          });

          return (
            <li
              key={tier.id}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-4"
            >
              {/*
                Nama paket menaut ke form dengan `?tier=<id>` supaya paket
                yang diklik langsung terpilih dan daftar benefit-nya terbuka.
                Sebelumnya parameter itu dibaca halaman form tetapi tidak
                pernah dihasilkan tautan mana pun.
              */}
              <Link
                href={`/events/${eventSlug}/sponsor?tier=${tier.id}`}
                className="font-heading text-base font-semibold text-foreground underline-offset-4 hover:underline"
              >
                {tier.name}
              </Link>

              <p className="text-sm font-medium text-foreground">
                {price.primary}
                {price.secondary ? (
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    ({price.secondary} est.)
                  </span>
                ) : null}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Amounts are charged in Indonesian rupiah. US dollar figures are
          indicative estimates only.
        </p>

        <Link
          href={`/events/${eventSlug}/sponsor`}
          className={cn(
            buttonStyles({ variant: "outline", size: "md" }),
            "shrink-0 justify-center",
          )}
        >
          Compare packages and apply
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
