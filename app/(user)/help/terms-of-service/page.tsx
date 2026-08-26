import type { Metadata } from "next";
import NotPublishedYet from "../section/NotPublishedYet";

// Sampai 26 Agustus 2026 halaman ini merender `execornerTerms` dari
// `@/app/auth/data/TermsSection` — 903 baris teks ketentuan ASLI milik Executive
// Corner, yang menyebut nama "ExeCorner" di empat pasal dan mencantumkan alamat
// surel mereka sebagai kontak resmi. Jadi MindCare menyajikan dokumen hukum
// perusahaan lain sebagai dokumen hukumnya sendiri.
//
// Itu berhenti di sini. Penggantinya sengaja tidak berisi satu klausul pun:
// mengarang teks hukum termasuk pantangan di `rules.md` pasal 10, karena yang
// terikat oleh klausul karangan adalah diaze, bukan saya. Berkas datanya
// (`app/auth/data/TermsSection.tsx`) belum dihapus — masih dipakai alur auth
// bawaan Executive Corner, dan itu bagian dari tugas bersih-bersih #14.
//
// `robots: index: false` supaya halaman "belum diterbitkan" tidak terindeks dan
// nanti bersaing dengan versi aslinya.

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Mindcare's terms of service have not been published yet.",
  robots: { index: false, follow: true },
};

export default function TermsOfServicePage() {
  return (
    <NotPublishedYet
      title="Terms of Service"
      summary="Ketentuan pemakaian MindCare belum kami terbitkan."
    />
  );
}
