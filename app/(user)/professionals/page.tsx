import type { Metadata } from "next";
import Professionals from "./Professionals";
import { getProfessionalFacets, getProfessionals } from "./data/professionals";

export const metadata: Metadata = {
  title: "Professionals",
  // Kata "verified" dicabut dari kalimat ini pada 24 Agustus 2026. Sebelumnya
  // bunyinya "Browse verified psychologists, psychiatrists, and counsellors",
  // yang menjanjikan SELURUH daftar sudah diperiksa — padahal enam dari lima
  // belas belum, dan halamannya sendiri jujur menunjukkan itu lewat badge yang
  // tidak muncul. Deskripsi halaman tidak boleh mengklaim lebih banyak daripada
  // yang dirender halamannya.
  description:
    "Browse psychologists, psychiatrists, and counsellors across Indonesia. Each listing shows whether we have checked a practice licence.",
};

// Badge verifikasi bergantung pada tanggal hari ini (`validUntil` dibanding
// sekarang), dan halaman statis membekukan `new Date()` di waktu build. Tanpa
// baris ini, izin yang habis besok akan tetap terlihat berlaku selamanya sampai
// ada yang men-deploy ulang — kelas bug yang sama dengan yang sudah diperbaiki di
// `/care-centres` dan `/events`, dan yang lolos `tsc`, eslint, DAN `next dev`.
//
// Angkanya mengikuti `/professionals/[slug]` (satu jam), bukan `/care-centres`
// (lima menit): di halaman ini tidak ada status buka/tutup, dan masa berlaku izin
// berketelitian tanggal — menyegarkannya tiap lima menit tidak membeli apa pun.
export const revalidate = 3600;

export default async function ProfessionalsPage() {
  // Satu acuan waktu untuk seluruh halaman, difiksasi di sini dan dioper ke
  // bawah. Jangan memanggil `new Date()` di dalam komponen — lihat catatan di
  // `Professionals.tsx` dan `ProfessionalsGrid.tsx`.
  const now = new Date().toISOString();

  const [professionals, facets] = await Promise.all([
    getProfessionals(),
    getProfessionalFacets(),
  ]);

  return (
    <Professionals professionals={professionals} facets={facets} now={now} />
  );
}
