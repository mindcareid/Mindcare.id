import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfessionals } from "../../professionals/data/professionals";
import type { Professional } from "../../professionals/type/professional";
import { getCareCentreBySlug, getCareCentres } from "../data/careCentres";
import CareCentreDetail from "./CareCentreDetail";

type CareCentrePageProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const centres = await getCareCentres();
  return centres.map((centre) => ({ slug: centre.slug }));
}

// Lima menit, sama dengan `/care-centres` dan halaman home, BUKAN sejam seperti
// halaman-halaman event. Alasannya bukan selera: halaman ini menampilkan "Open
// now" di hero dan menandai baris hari ini di tabel jam, dan status itu berubah
// beberapa kali sehari di tiap centre. Dengan `generateStaticParams` di atas,
// kesembilan halaman dirender saat build — tanpa baris ini, sebuah klinik akan
// tertulis "Open now" sepanjang malam sampai deploy berikutnya, dan itu jenis
// salah yang lolos `tsc`, lolos eslint, bahkan lolos `next dev`.
export const revalidate = 300;

export async function generateMetadata({
  params,
}: CareCentrePageProps): Promise<Metadata> {
  const centre = await getCareCentreBySlug(params.slug);
  if (!centre) return { title: "Care centre not found" };

  return {
    title: centre.name,
    // Diturunkan dari data, bukan dari kalimat karangan: `CareCentre` tidak
    // punya field ringkasan, dan mengarang satu kalimat promosi tentang sebuah
    // klinik lebih jauh melenceng daripada menyusun ulang keterangan yang ada.
    description: `${centre.kind} di ${centre.address.city}, ${centre.address.province}.`,
  };
}

export default async function CareCentrePage({ params }: CareCentrePageProps) {
  const centre = await getCareCentreBySlug(params.slug);
  if (!centre) notFound();

  // Satu acuan waktu untuk seluruh halaman, ditetapkan sekali di sini lalu
  // diteruskan ke bawah. Kalau tiap komponen memanggil `new Date()` sendiri,
  // hero bisa berkata "Open now" sementara tabel jam di bawahnya sudah lewat
  // menit tutup — dan selisih itu mustahil ditelusuri belakangan.
  const now = new Date().toISOString();

  // Profesionalnya diambil di sini, bukan lewat accessor baru di folder
  // `professionals/` — pola yang sama dengan halaman detail Solutions dan
  // Professionals, supaya relasinya tetap searah: `care-centres` tahu tentang
  // `professionals`, tidak sebaliknya.
  const all = await getProfessionals();
  const bySlug = new Map(all.map((item) => [item.slug, item]));

  // Urutannya mengikuti `professionalSlugs`, bukan diurut ulang. Urutan di data
  // itu satu-satunya urutan yang bisa diatur belakangan tanpa mengubah kode.
  //
  // `filter` di bawah ini seharusnya tidak pernah membuang apa pun: invarian 32
  // di harness menolak slug yang tidak ada di data profesional. Ia tetap ada
  // karena TypeScript tidak tahu soal harness, dan karena halaman yang hilang
  // satu kartu lebih baik daripada halaman yang gagal dirender seluruhnya.
  const professionals = centre.professionalSlugs
    .map((slug) => bySlug.get(slug))
    .filter((item): item is Professional => item !== undefined);

  return (
    <CareCentreDetail centre={centre} professionals={professionals} now={now} />
  );
}
