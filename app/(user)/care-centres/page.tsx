import type { Metadata } from "next";
import CareCentres from "./CareCentres";
import { getCareCentreFacets, getCareCentres } from "./data/careCentres";

export const metadata: Metadata = {
  title: "Care Centres",
  description:
    "Clinics, hospitals, and counselling centres for mental health across Indonesia.",
};

// Halaman ini menampilkan status buka/tutup, jadi hasilnya bergantung pada
// "sekarang" — dan halaman statis membekukan `new Date()` di waktu build. Tanpa
// baris di bawah, sebuah klinik akan selamanya tertulis "Open" pada jam ia
// dibangun. Salah macam ini lolos `tsc`, lolos eslint, DAN lolos `next dev`
// (yang merender ulang setiap request), jadi hanya muncul di produksi.
//
// Lima menit, bukan sejam seperti halaman event: "Open now" berubah beberapa kali
// sehari di setiap centre, sedangkan "Sold out" berubah sekali seumur acara.
export const revalidate = 300;

export default async function CareCentresPage() {
  // Satu `new Date()` untuk seluruh halaman. Dua pemanggilan berarti filter dan
  // kartu bisa memakai menit yang berbeda.
  const now = new Date().toISOString();

  const [centres, facets] = await Promise.all([
    getCareCentres(),
    getCareCentreFacets(),
  ]);

  return <CareCentres centres={centres} facets={facets} now={now} />;
}
