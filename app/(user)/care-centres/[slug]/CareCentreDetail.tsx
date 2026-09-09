import Container from "@/app/components/reusable/Container";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import ProfessionalsGrid from "../../professionals/section/ProfessionalsGrid";
import type { Professional } from "../../professionals/type/professional";
import CentreHero from "../section/CentreHero";
import CentreHours from "../section/CentreHours";
import CentreLocation from "../section/CentreLocation";
import CentreServices from "../section/CentreServices";
import type { CareCentre } from "../type/careCentre";

// Susunan halaman mengikuti `SolutionDetail` dan `ProfessionalProfile`: hero
// selebar layar, lalu satu `Container` dengan jarak antarbagian yang seragam.
//
// Urutan bagiannya mengikuti urutan pertanyaan orang yang sedang mencari tempat
// berobat: apa yang bisa saya dapat di sini (Services), kapan saya bisa datang
// (Opening hours), di mana tempatnya (Location), siapa yang ada di sana
// (Professionals). Jam praktik ditaruh sebelum alamat karena jauh lebih sering
// jadi alasan sebuah tempat dibatalkan dari daftar pilihan.
//
// TIDAK ada bagian "More care centres" di bawah, dan itu perbedaan dari halaman
// detail lain yang semuanya punya bagian serupa. Belum ada `getRelatedCareCentres`,
// dan menambahkannya berarti memutuskan sendiri apa artinya "mirip" untuk sebuah
// klinik — kota yang sama, jenis yang sama, atau layanan yang bertumpang. Itu
// keputusan konten, jadi dilaporkan dulu, bukan dikarang di sini.

type CareCentreDetailProps = {
  centre: CareCentre;
  /**
   * Profesional yang terdaftar di centre ini, sudah diambil di `page.tsx`.
   * Bisa kosong: dua profesional di mock data belum terikat centre mana pun,
   * dan sebuah centre boleh belum punya siapa-siapa.
   */
  professionals: Professional[];
  /** Acuan waktu tunggal untuk seluruh halaman, ISO string. */
  now: string;
};

export default function CareCentreDetail({
  centre,
  professionals,
  now,
}: CareCentreDetailProps) {
  return (
    <div className="min-h-screen">
      <CentreHero centre={centre} now={now} />

      <Container className="pb-16 md:pb-24">
        <div className="space-y-14 md:space-y-16">
          <CentreServices centre={centre} />

          <CentreHours centre={centre} now={now} />

          <CentreLocation centre={centre} />

          {professionals.length > 0 && (
            <div>
              {/* Judulnya menyebut "listed", dan keterangannya mengatakan
                  terus-terang apa yang tidak diwakili daftar ini. Sebuah rumah
                  sakit punya puluhan tenaga; yang muncul di sini hanya yang
                  punya halaman di Mindcare. Tanpa keterangan itu, daftar tiga
                  orang di bawah nama rumah sakit terbaca seperti klaim bahwa
                  cuma ada tiga orang di sana. */}
              <SectionHeader
                title="Professionals listed here"
                description="Only professionals with a Mindcare profile appear below. Other staff at this centre may not be listed."
                href="/professionals"
                underline
              />
              <div className="mt-6">
                <ProfessionalsGrid professionals={professionals} now={now} />
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
