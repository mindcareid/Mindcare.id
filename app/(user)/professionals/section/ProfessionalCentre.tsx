import Link from "next/link";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import Tag from "@/app/components/reusable/Tag";
import VerifiedBadge from "@/app/components/reusable/VerifiedBadge";
import {
  VERIFICATION_POLICY_PATH,
  verificationLabelOf,
} from "../../data/verification";
import type { CareCentre } from "../../care-centres/type/careCentre";

// Tempat praktik seorang profesional. Bentuknya sengaja dibikin sama dengan
// `SolutionLead`: satu kartu selebar `max-w-2xl` di dalam sebuah bagian, dengan
// petak berlambang di kiri dan tautan panah di bawah kanan isinya.
//
// Komponen ini TIDAK dirender kalau profesionalnya tidak terikat centre mana pun
// (lihat `ProfessionalProfile`). Dua dari lima belas profesional di mock data
// memang begitu. Pilihan lain yang ditolak: menulis "Practises independently".
// Kalimat itu terdengar seperti keterangan, padahal isinya cuma ketiadaan data —
// `professionalSlugs` yang belum diisi tidak sama artinya dengan orang yang
// memang praktik mandiri, dan halaman ini tidak boleh mengaku tahu bedanya.
//
// SENGAJA tanpa status buka/tutup dan tanpa tabel jam, meskipun keduanya sudah
// tersedia lewat `centreHours.ts`. Dua alasan:
//
//   1. Di halaman ini sudah ada satu titik status, yaitu `isAvailableNow` milik
//      orangnya. Titik kedua di kartu ini akan terbaca sebagai kabar tentang
//      orang yang sama, padahal ia tentang gedungnya.
//   2. Begitu halaman ini menampilkan "Open now", `revalidate`-nya harus turun
//      dari 3600 ke 300 — status buka berubah beberapa kali sehari. Menaruhnya
//      di sini berarti menyeret seluruh halaman profil ke daur segar yang lima
//      kali lebih sering demi satu baris yang halaman centre-nya sajikan lebih
//      lengkap, satu klik dari sini.

type ProfessionalCentreProps = {
  centre: CareCentre;
  /** Acuan waktu tunggal dari `page.tsx`, ISO string. Dipakai badge verifikasi. */
  now: string;
};

export default function ProfessionalCentre({
  centre,
  now,
}: ProfessionalCentreProps) {
  // Label FASILITAS meski kartu ini berada di halaman seorang profesional.
  // Verifikasi tidak menurun ke bawah: centre yang terverifikasi tidak membuat
  // orangnya terverifikasi, dan sebaliknya. Yang dilencanai di sini gedungnya.
  const verifiedLabel = verificationLabelOf(
    centre.verification,
    now,
    "facility",
  );

  return (
    <div>
      <SectionHeader title="Practises at" underline />

      <div className="mt-6 flex max-w-2xl flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:flex-row">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-brand-mint-200">
          <Building2 className="size-7 text-accent" aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading text-lg font-semibold text-foreground">
              {centre.name}
            </p>
            {/* Tanggal pemeriksaan SENGAJA tidak ikut di sini. Aturannya: tanggal
                hanya muncul di halaman yang entitasnya jadi subjek — di halaman
                ini subjeknya orangnya, centre-nya cuma keterangan. Halaman
                centre-nya sendiri yang menyajikan tanggalnya, satu klik dari
                sini, dan itu mencegah satu tanggal punya dua tempat tampil yang
                bisa menyimpang. */}
            {verifiedLabel && (
              <VerifiedBadge
                label={verifiedLabel}
                href={VERIFICATION_POLICY_PATH}
              />
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">{centre.kind}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {`${centre.address.street}, ${centre.address.city}`}
            </span>
          </div>

          {centre.acceptsBpjs && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Tag tone="mint">BPJS accepted</Tag>
            </div>
          )}

          <Link
            href={`/care-centres/${centre.slug}`}
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-brand-navy-800"
          >
            View care centre
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
