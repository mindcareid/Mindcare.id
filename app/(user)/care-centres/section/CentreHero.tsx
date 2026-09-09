import { Building2, MapPin, Users } from "lucide-react";
import MetaRow from "@/app/components/reusable/MetaRow";
import PageHero from "@/app/components/reusable/PageHero";
import StatusDot from "@/app/components/reusable/StatusDot";
import Tag from "@/app/components/reusable/Tag";
import VerifiedBadge from "@/app/components/reusable/VerifiedBadge";
import { isOpenAt, summariseTodayHours } from "../data/centreHours";
import {
  VERIFICATION_POLICY_PATH,
  formatCheckedOn,
  verificationLabelOf,
} from "../../data/verification";
import type { CareCentre } from "../type/careCentre";

// Hero halaman detail. Bentuknya mengikuti `ProfessionalHero`: `PageHero` dengan
// lencana di atas, `MetaRow`, lalu tag.
//
// SENGAJA tanpa `media`, dan itu satu-satunya perbedaan mencolok dari hero
// halaman profesional. Tiga hal yang sudah dipertimbangkan dan ditolak: foto
// gedung (tidak ada satu pun `photoUrl` yang terisi, dan mengarang gambar
// bangunan tidak sama dengan mengarang teks — orang akan mengira itu tempatnya),
// kotak inisial seperti di halaman profesional (inisial mewakili orang, bukan
// bangunan), dan peta placeholder (ia sudah dipakai di bagian Location di bawah;
// dua peta di satu halaman cuma mengulang janji yang sama dua kali).
//
// `PageHero` tanpa media otomatis jadi satu kolom `max-w-3xl`, jadi tidak ada
// kolom kanan yang menganga.
//
// TIDAK ADA tombol "Get directions" dan TIDAK ADA nomor telepon di sini —
// dua-duanya keputusan sadar, alasannya di `design.md` bagian 20.

type CentreHeroProps = {
  centre: CareCentre;
  /** Acuan waktu tunggal dari `page.tsx`, ISO string. */
  now: string;
};

export default function CentreHero({ centre, now }: CentreHeroProps) {
  const listed = centre.professionalSlugs.length;
  const open = isOpenAt(centre, now);
  // Label fasilitas, BUKAN label orang: yang diperiksa di sini izin operasional
  // dan nomor registrasi fasilitas, bukan surat izin praktik seseorang.
  const verifiedLabel = verificationLabelOf(centre.verification, now, "facility");

  return (
    <PageHero
      eyebrow={centre.kind}
      title={centre.name}
      subtitle={`${centre.address.street}, ${centre.address.city}`}
    >
      <div className="flex flex-col gap-5">
        {(verifiedLabel || open) && (
          <div className="flex flex-wrap items-center gap-2">
            {verifiedLabel && (
              <VerifiedBadge
                label={verifiedLabel}
                checkedOn={formatCheckedOn(centre.verification)}
                href={VERIFICATION_POLICY_PATH}
              />
            )}
            {open && (
              <span className="inline-flex items-center rounded-sm border border-border bg-card px-2 py-1">
                <StatusDot status="open" label="Open now" />
              </span>
            )}
          </div>
        )}

        <MetaRow
          items={[
            {
              icon: MapPin,
              text: `${centre.address.city}, ${centre.address.province}`,
            },
            { icon: Building2, text: summariseTodayHours(centre, now) },
            {
              // Sama dengan kartu di halaman daftar: "listed" ditulis eksplisit
              // karena angkanya jumlah profesional yang terdaftar di Mindcare,
              // bukan jumlah orang yang bekerja di tempat ini. Untuk rumah sakit
              // bedanya besar.
              icon: Users,
              text: `${listed} ${listed === 1 ? "professional" : "professionals"} listed`,
            },
          ]}
        />

        {/* Hanya BPJS di sini, TIDAK ada tag layanan. Nama-nama layanan pindah
            ke bagiannya sendiri beberapa senti di bawah; kalau keduanya ada,
            pembaca membaca daftar yang sama dua kali dalam satu tarikan mata.
            Pembagiannya mengikuti hero halaman profesional: yang di hero cuma
            sifat sampingan (di sana `sessionModes`), yang utama dapat bagian
            sendiri.

            BPJS yang tetap tinggal, bukan sebaliknya, karena bagi banyak orang
            itu satu keterangan paling menentukan di seluruh halaman — kalau
            tidak diterima, sisa halamannya tidak perlu dibaca. */}
        {centre.acceptsBpjs && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="mint">BPJS accepted</Tag>
          </div>
        )}
      </div>
    </PageHero>
  );
}
