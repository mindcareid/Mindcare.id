import { Clock, MapPin, MessageCircle } from "lucide-react";
import EntityCard from "@/app/components/reusable/EntityCard";
import EmptyState from "@/app/components/reusable/EmptyState";
import { verificationLabelOf } from "../../data/verification";
import type { Professional } from "../type/professional";

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type ProfessionalsGridProps = {
  professionals: Professional[];
  /**
   * Acuan waktu tunggal dari halaman, ISO string. Wajib — pola yang sama dengan
   * `CareCentresGrid`.
   *
   * Ditambahkan 24 Agustus 2026 karena badge verifikasi berhenti jadi boolean
   * beku dan mulai bergantung pada tanggal berlaku dokumen. Jangan diganti
   * `new Date()` di dalam sini: komponen ini dirender di empat halaman, dan kalau
   * kartu memakai acuan waktu sendiri sementara hero memakai punya `page.tsx`,
   * keduanya bisa berbeda pendapat soal orang yang sama pada hari yang sama —
   * kelas bug yang persis sama dengan "kartu bilang WIB, hero bilang GMT+7".
   */
  now: string;
  resetAction?: React.ReactNode;
};

export default function ProfessionalsGrid({
  professionals,
  now,
  resetAction,
}: ProfessionalsGridProps) {
  if (professionals.length === 0) {
    return (
      <EmptyState
        title="No professionals match your filters"
        description="Try removing a filter or searching with a different keyword."
        action={resetAction}
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {professionals.map((professional) => (
        <EntityCard
          key={professional.id}
          href={`/professionals/${professional.slug}`}
          title={professional.fullName}
          subtitle={professional.credentials}
          imageUrl={professional.photoUrl}
          verifiedLabel={verificationLabelOf(
            professional.verification,
            now,
            "person",
          )}
          status={professional.isAvailableNow ? "online" : undefined}
          tags={[
            ...professional.areasOfSupport.map((area) => ({
              label: area.name,
              tone: "lavender" as const,
            })),
            ...professional.sessionModes.map((mode) => ({
              label: mode,
              tone: "mint" as const,
            })),
          ]}
          maxTags={3}
          meta={[
            { icon: MapPin, text: professional.location.city },
            {
              icon: Clock,
              text: `${professional.yearsOfExperience} yrs experience`,
            },
            {
              icon: MessageCircle,
              text: professional.languages.join(", "),
            },
          ]}
          footnote={`From ${priceFormatter.format(professional.startingPriceIdr)} / session`}
          actionLabel="View Profile"
          actionVariant="secondary"
        />
      ))}
    </div>
  );
}
