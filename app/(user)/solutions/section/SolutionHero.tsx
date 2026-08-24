import Link from "next/link";
import { CalendarCheck, Clock, MapPin, Video } from "lucide-react";
import Container from "@/app/components/reusable/Container";
import MetaRow from "@/app/components/reusable/MetaRow";
import Tag from "@/app/components/reusable/Tag";
import { Blob, LeafOrnament } from "@/app/components/reusable/Ornaments";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import type { ButtonVariant } from "@/app/components/reusable/buttonStyles";
import type { Solution, SolutionTheme } from "../type/solution";

// Pemetaan yang sama dengan `SolutionsGrid`: warna per kategori keputusan
// atasan, jadi `theme` disimpan di data dan pemetaan theme -> variant tombol
// tinggal di komponen. Kalau nanti nada `Tag` bernuansa navy ada, kategori di
// hero ini bisa ikut memakainya.
const actionVariantByTheme: Record<SolutionTheme, ButtonVariant> = {
  navy: "primary",
  purple: "secondary",
  emerald: "accent",
};

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type SolutionHeroProps = {
  solution: Solution;
};

export default function SolutionHero({ solution }: SolutionHeroProps) {
  const isOnline = solution.deliveryModes.includes("Online");
  const variant = actionVariantByTheme[solution.category.theme];

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <Blob
          tone="lavender"
          className="absolute -left-24 -top-24 size-72 opacity-70"
        />
        <Blob
          tone="mint"
          className="absolute -right-16 top-32 size-64 opacity-60"
        />
        <LeafOrnament className="absolute right-6 top-0 hidden h-56 lg:block" />
      </div>

      <Container className="py-14 md:py-20">
        <div className="max-w-3xl">
          <Tag tone="mint">{solution.category.name}</Tag>

          <h1 className="mt-4 font-heading text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground md:text-[40px] lg:text-[46px]">
            {solution.title}
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {solution.summary}
          </p>

          <MetaRow
            className="mt-6"
            items={[
              {
                icon: CalendarCheck,
                text: `${solution.sessionCount} ${
                  solution.sessionCount === 1 ? "session" : "sessions"
                }`,
              },
              { icon: Clock, text: `${solution.sessionMinutes} min each` },
              {
                icon: isOnline ? Video : MapPin,
                text: solution.deliveryModes.join(" & "),
              },
            ]}
          />

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {solution.focusAreas.map((area) => (
              <Tag key={area.id} tone="lavender">
                {area.name}
              </Tag>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {/* `priceIdr: null` bukan data yang belum terisi — itu keadaan
                "harganya dinegosiasi per klien", dan di situ tombolnya berubah
                jadi "Contact us". Lihat design.md bagian 18.

                Tujuannya `/#contact`, BUKAN `/contact` — rute itu tidak ada di
                repo ini. Seluruh tautan kontak yang sudah ada (menu.ts,
                company/pending, EventDetail milik EC) menunjuk anchor di home. */}
            {solution.priceIdr === null ? (
              <>
                <p className="text-lg font-semibold text-foreground">
                  Pricing on request
                </p>
                <Link
                  href="/#contact"
                  className={buttonStyles({ variant, size: "lg" })}
                >
                  Contact us
                </Link>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-foreground">
                  {priceFormatter.format(solution.priceIdr)}
                  <span className="text-base font-normal text-muted-foreground">
                    {" / programme"}
                  </span>
                </p>
                <Link
                  href="/#contact"
                  className={buttonStyles({ variant, size: "lg" })}
                >
                  Enquire
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
