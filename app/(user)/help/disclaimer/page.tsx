import type { Metadata } from "next";
import NotPublishedYet from "../section/NotPublishedYet";

// Halaman baru 26 Agustus 2026. Sebelumnya alamat ini 404 padahal ditautkan dari
// footer, artinya tautan mati yang muncul di SETIAP halaman situs.
//
// Isinya placeholder, bukan disclaimer karangan. Batas tanggung jawab sebuah
// direktori kesehatan mental adalah teks hukum, dan mengarangnya termasuk
// pantangan di `rules.md` pasal 10.

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Mindcare's disclaimer has not been published yet.",
  robots: { index: false, follow: true },
};

export default function DisclaimerPage() {
  return (
    <NotPublishedYet
      title="Disclaimer"
      summary="Batas tanggung jawab MindCare sebagai direktori belum kami tuangkan ke satu dokumen."
    />
  );
}
