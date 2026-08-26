import Link from "next/link";
import { ArrowRight, Building2, GraduationCap, MapPin } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import Tag from "@/app/components/reusable/Tag";
import VerifiedBadge from "@/app/components/reusable/VerifiedBadge";
import {
  VERIFICATION_POLICY_PATH,
  verificationLabelOf,
} from "../../data/verification";
import type { CareCentre } from "../../care-centres/type/careCentre";
import type { Professional } from "../../professionals/type/professional";
import type { EventHost } from "../type/event";

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

const cardClass =
  "mt-6 flex max-w-2xl flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:flex-row";

const avatarClass =
  "flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-lavender-200 font-heading text-xl font-semibold text-secondary";

type EventHostCardProps = {
  host: EventHost;
  /** Terisi kalau `host.kind === "professional"` dan slugnya benar-benar ada. */
  professional: Professional | null;
  /** Terisi kalau `host.kind === "centre"` dan slugnya benar-benar ada. */
  centre: CareCentre | null;
  /** Acuan waktu tunggal dari `page.tsx`, ISO string. Dipakai badge verifikasi. */
  now: string;
};

// Judulnya "Hosted by", bukan "Speaker" atau "Facilitator": `host` di kontrak
// event bisa berupa orang ATAU tempat, dan lima dari sembilan event mock
// diselenggarakan klinik. Menyebutnya "Speaker" akan salah untuk yang klinik.
//
// Perhatikan komponen ini merender DUA subjek yang berbeda, jadi labelnya juga
// dua: penyelenggara orang dapat "Licence checked", penyelenggara klinik dapat
// "Licence & permit checked". Sebelum 24 Agustus 2026 dua-duanya berbunyi
// "Verified" — satu file, satu kata, dua klaim yang tidak sama.
export default function EventHostCard({
  host,
  professional,
  centre,
  now,
}: EventHostCardProps) {
  const professionalLabel = professional
    ? verificationLabelOf(professional.verification, now, "person")
    : null;
  const centreLabel = centre
    ? verificationLabelOf(centre.verification, now, "facility")
    : null;

  return (
    <div>
      <SectionHeader title="Hosted by" underline />

      {professional ? (
        <div className={cardClass}>
          <span className={avatarClass}>
            <span aria-hidden="true">{initialsOf(professional.fullName)}</span>
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-heading text-lg font-semibold text-foreground">
                {professional.fullName}
              </p>
              {professionalLabel && (
                <VerifiedBadge
                  label={professionalLabel}
                  href={VERIFICATION_POLICY_PATH}
                />
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {professional.credentials}
            </p>

            <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground">
              {professional.headline}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                />
                {`${professional.yearsOfExperience} yrs experience`}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {professional.location.city}
              </span>
            </div>

            <Link
              href={`/professionals/${professional.slug}`}
              className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-brand-navy-800"
            >
              View profile
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      ) : centre ? (
        <div className={cardClass}>
          <span className={avatarClass}>
            <Building2 className="size-7" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-heading text-lg font-semibold text-foreground">
                {centre.name}
              </p>
              {centreLabel && (
                <VerifiedBadge
                  label={centreLabel}
                  href={VERIFICATION_POLICY_PATH}
                />
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">{centre.kind}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {`${centre.address.city}, ${centre.address.province}`}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {centre.services.slice(0, 3).map((service) => (
                <Tag key={service.id} tone="mint">
                  {service.name}
                </Tag>
              ))}
            </div>

            {/* SENGAJA tanpa tautan "View care centre" dan tanpa nomor telepon.
                Nomor teleponnya masih karangan, jadi memasangnya di sini berarti
                mengundang orang menelepon nomor yang bukan milik siapa-siapa.

                Catatan 24 Agustus 2026: alasan aslinya ada DUA, dan yang satu
                sudah kedaluwarsa — rute `/care-centres/<slug>` dulu belum ada
                (tugas #28) sehingga tautannya akan 404. Rute itu sekarang sudah
                jadi, jadi yang menahan tautannya tinggal keputusan tata letak,
                bukan halaman yang belum dibangun. Menambahkannya perlu
                persetujuan diaze lebih dulu karena ia mengubah tampilan halaman
                yang sudah ditinjau. Lihat design.md bagian 19. */}
          </div>
        </div>
      ) : (
        // Slug penyelenggara tidak ketemu di data mana pun. Harness menjaga ini
        // (invarian untuk kind professional maupun centre), jadi kalau kartu ini
        // yang tampil, berarti harnessnya yang perlu diperiksa — bukan halaman
        // yang perlu diperbaiki. Namanya tetap ditampilkan supaya halaman tidak
        // kehilangan informasi siapa penyelenggaranya.
        <div className={cardClass}>
          <span className={avatarClass}>
            <span aria-hidden="true">{initialsOf(host.name)}</span>
          </span>
          <div className="min-w-0">
            <p className="font-heading text-lg font-semibold text-foreground">
              {host.name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {host.kind === "professional" ? "Professional" : "Care centre"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
