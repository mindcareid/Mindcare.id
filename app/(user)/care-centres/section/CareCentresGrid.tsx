import { Clock, MapPin, Users } from "lucide-react";
import EntityCard, {
  type EntityCardTag,
} from "@/app/components/reusable/EntityCard";
import EmptyState from "@/app/components/reusable/EmptyState";
import type { MetaItem } from "@/app/components/reusable/MetaRow";
import { cn } from "@/lib/utils";
import { isOpenAt, summariseTodayHours } from "../data/centreHours";
import type { CareCentre } from "../type/careCentre";

// Server-safe: tidak ada state di sini. State pencarian dan filter dipegang
// `CareCentres.tsx`, sesuai rules.md pasal 4 (dorong batas client sedalam
// mungkin).
//
// `now` wajib diterima sebagai prop, bukan dibaca sendiri lewat `new Date()`.
// Dua alasan: satu halaman harus punya SATU acuan waktu supaya status buka dan
// baris jam tidak saling bertentangan, dan komponen ini dipakai halaman daftar
// maupun home — dua-duanya yang memfiksasi waktunya, bukan komponen ini.

function metaOf(centre: CareCentre, now: string): MetaItem[] {
  // Kartu menampilkan jam HARI INI, bukan ringkasan sepekan. Tabel tujuh baris
  // tinggal di halaman detail: satu baris di kartu tidak cukup untuk jadwal yang
  // tidak seragam, dan "jam hari ini" justru yang dicari orang yang sedang
  // memutuskan mau datang sekarang atau tidak.
  const listed = centre.professionalSlugs.length;

  return [
    { icon: MapPin, text: centre.address.city },
    { icon: Clock, text: summariseTodayHours(centre, now) },
    {
      // "listed" ditulis eksplisit karena angkanya jumlah profesional yang
      // TERDAFTAR di Mindcare, bukan jumlah orang yang bekerja di sana. Untuk
      // rumah sakit bedanya besar, dan tanpa kata itu angkanya jadi klaim yang
      // tidak bisa dipertanggungjawabkan.
      icon: Users,
      text: `${listed} ${listed === 1 ? "professional" : "professionals"} listed`,
    },
  ];
}

function tagsOf(centre: CareCentre): EntityCardTag[] {
  const tags: EntityCardTag[] = [];

  // BPJS ditaruh PALING DEPAN dengan sengaja. `EntityCard` memotong tag di tag
  // ketiga, dan bagi orang yang mencari layanan kesehatan mental di Indonesia,
  // "ditanggung BPJS atau tidak" hampir selalu informasi paling menentukan —
  // jangan sampai ia yang kena potong.
  if (centre.acceptsBpjs) {
    tags.push({ label: "BPJS", tone: "mint" });
  }

  for (const service of centre.services) {
    tags.push({ label: service.name, tone: "lavender" });
  }

  return tags;
}

type CareCentresGridProps = {
  centres: CareCentre[];
  /** Acuan waktu tunggal dari halaman, ISO string. */
  now: string;
  className?: string;
};

export default function CareCentresGrid({
  centres,
  now,
  className,
}: CareCentresGridProps) {
  if (centres.length === 0) {
    return (
      <EmptyState
        title="No centres match your filters"
        description="Try widening the city or clearing a filter there may be a centre nearby under a different service."
        className={className}
      />
    );
  }

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {centres.map((centre) => (
        <EntityCard
          key={centre.id}
          href={`/care-centres/${centre.slug}`}
          title={centre.name}
          subtitle={centre.kind}
          imageUrl={centre.photoUrl}
          imageAlt={centre.name}
          verified={centre.isVerified}
          status={isOpenAt(centre, now) ? "open" : undefined}
          tags={tagsOf(centre)}
          meta={metaOf(centre, now)}
          actionLabel="View Centre"
          actionVariant="primary"
        />
      ))}
    </div>
  );
}
