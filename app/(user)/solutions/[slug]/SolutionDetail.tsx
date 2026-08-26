import { Info } from "lucide-react";
import Container from "@/app/components/reusable/Container";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { Professional } from "../../professionals/type/professional";
import PartnerStrip from "../section/PartnerStrip";
import SolutionCurriculum from "../section/SolutionCurriculum";
import SolutionHero from "../section/SolutionHero";
import SolutionLead from "../section/SolutionLead";
import SolutionOverview from "../section/SolutionOverview";
import SolutionsGrid from "../section/SolutionsGrid";
import type { Solution } from "../type/solution";

type SolutionDetailProps = {
  solution: Solution;
  lead: Professional | null;
  related: Solution[];
  /** Acuan waktu tunggal dari `page.tsx`, ISO string. Dipakai badge verifikasi. */
  now: string;
};

export default function SolutionDetail({
  solution,
  lead,
  related,
  now,
}: SolutionDetailProps) {
  return (
    <div className="min-h-screen">
      <SolutionHero solution={solution} />

      <Container className="pb-16 md:pb-24">
        <div className="space-y-14 md:space-y-16">
          <SolutionOverview solution={solution} />

          <SolutionCurriculum solution={solution} />

          {lead && <SolutionLead professional={lead} now={now} />}

          {solution.partners.length > 0 && (
            <div>
              <SectionHeader title="Delivered with" underline />
              <PartnerStrip
                partners={solution.partners}
                className="mt-6 justify-start"
              />
            </div>
          )}

          <div className="flex max-w-prose gap-3 rounded-xl border border-border bg-brand-mint-100 p-5">
            <Info
              className="mt-0.5 size-5 shrink-0 text-accent"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-foreground">
              Rangkaian program disusun bersama profesional yang memimpinnya dan
              bisa disesuaikan setelah pertemuan pertama. Isi dan jumlah
              pertemuan di halaman ini gambaran umum, bukan urutan yang kaku.
            </p>
          </div>

          {related.length > 0 && (
            <div>
              <SectionHeader
                title="More solutions"
                href="/solutions"
                underline
              />
              <SolutionsGrid solutions={related} className="mt-6" />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
