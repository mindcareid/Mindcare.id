import { MapPin } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import CentresMapPlaceholder from "./CentresMapPlaceholder";
import type { CareCentre } from "../type/careCentre";

// Alamat dan satu-satunya peta placeholder di halaman ini (hero-nya sengaja
// tidak punya media — alasannya di `CentreHero.tsx`).
//
// Tiga hal yang TIDAK ada di sini, ketiganya keputusan sadar dan tercatat di
// `design.md` bagian 20:
//
//   1. Nomor telepon. `CareCentre.phone` memang terisi, tapi isinya karangan.
//      Nomor karangan yang dipasang di bawah nama klinik yang terbaca sungguhan
//      adalah satu-satunya konten fiktif di proyek ini yang bisa membuat orang
//      menelepon nomor asing — dan orang yang menelepon direktori kesehatan
//      jiwa kadang sedang dalam keadaan yang tidak baik. Jadi tidak dirender
//      sampai nomornya nyata.
//   2. Tombol "Get directions". Tautan itu akan mengirim orang ke peta luar
//      berdasarkan `coordinates` karangan, jadi janjinya lebih besar daripada
//      yang bisa dipenuhi datanya.
//   3. Angka lintang/bujurnya sendiri. Ia dipakai peta nanti, bukan dibaca
//      manusia; menampilkannya hanya memindahkan data mentah ke layar.
//
// Ketiadaan kontak dinyatakan satu baris, bukan dibiarkan kosong: bagian alamat
// tanpa keterangan apa pun terbaca seperti ada yang lupa diisi.

type CentreLocationProps = {
  centre: CareCentre;
};

export default function CentreLocation({ centre }: CentreLocationProps) {
  const { street, city, province, postalCode } = centre.address;

  return (
    <div>
      <SectionHeader title="Location" underline />

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex gap-3 ">
            <MapPin
              className="mt-1 size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <address className="flex-1 text-base leading-relaxed text-foreground not-italic">
              {street}, {city}, {postalCode}, {province}
            </address>
          </div>

          <p className="mt-5 border-t border-border pt-5 text-[13px] text-muted-foreground">
            Phone numbers and directions are not published in the directory yet.
          </p>
        </div>

        <CentresMapPlaceholder caption={`${city}, ${province}`} />
      </div>
    </div>
  );
}
