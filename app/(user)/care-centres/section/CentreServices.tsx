import { Check } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { CareCentre } from "../type/careCentre";

// Layanan yang tersedia di sebuah pusat layanan.
//
// SENGAJA tidak memakai bentuk daftar bergaris seperti `ProfessionalServices`.
// Bentuk itu punya kolom harga dan durasi di kanan tiap baris, sementara
// `CentreService` hanya berisi `{ id, slug, name }` — tidak ada harga, tidak ada
// durasi. Kalau bentuknya disamakan, tiap baris akan punya ruang kanan yang
// kosong dan halamannya terbaca seperti sedang gagal memuat sesuatu.
//
// Harganya juga tidak boleh dikarang. Tarif satu klinik itu keterangan yang
// orang pakai untuk memutuskan datang atau tidak, dan angka karangan di situ
// jauh lebih merugikan daripada tidak ada angka sama sekali. Jadi bentuknya
// petak-petak nama layanan, dan ketiadaan tarif dinyatakan terang-terangan di
// bawahnya — sebagai keterangan tentang direktorinya, bukan tentang kliniknya.
//
// Nama layanannya tetap bahasa Indonesia ("Konsultasi Psikiatri"), sesuai
// rules.md pasal 7: label antarmuka Inggris, isi konten Indonesia.

type CentreServicesProps = {
  centre: CareCentre;
};

export default function CentreServices({ centre }: CentreServicesProps) {
  if (centre.services.length === 0) return null;

  return (
    <div>
      <SectionHeader title={`Service at ${centre.name}`} underline />

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {centre.services.map((service) => (
          <li
            key={service.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-mint-100">
              <Check className="size-4 text-accent" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-foreground">
              {service.name}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 max-w-prose text-[13px] text-muted-foreground">
        Session fees for care centres are not listed in the directory yet.
      </p>
    </div>
  );
}
