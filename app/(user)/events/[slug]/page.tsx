import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCareCentreBySlug } from "../../care-centres/data/careCentres";
import { getProfessionalBySlug } from "../../professionals/data/professionals";
import { getEventBySlug, getEvents, getRelatedEvents } from "../data/events";
import EventDetail from "./EventDetail";

type EventPageProps = {
  params: { slug: string };
};

// Halaman ini menampilkan keadaan yang bergantung waktu — "Sold out", "Event has
// ended", sisa kursi. Tanpa `revalidate`, Next merender sekali saat build dan
// `now` di bawah membeku di jam build: acara yang sudah lewat akan selamanya
// tampil sebagai "Request a seat" sampai ada deploy berikutnya. Dengan angka ini
// halamannya tetap diprerender (cepat) tapi disegarkan tiap jam.
//
// Konsekuensinya yang harus disadari: acara yang selesai 20:30 bisa masih
// terlihat terbuka sampai paling lama satu jam sesudahnya. Untuk direktori ini
// selisih itu diterima; kalau nanti ada pembelian tiket sungguhan, keadaan kursi
// tidak boleh lagi diambil dari halaman yang dicache.
export const revalidate = 3600;

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) return { title: "Event not found" };

  return {
    title: event.title,
    description: event.summary,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventBySlug(params.slug);
  if (!event) notFound();

  // "Sekarang" ditetapkan SEKALI di sini lalu diturunkan sebagai `now: string`.
  // Kalau tiap komponen memanggil `new Date()` sendiri, hero bisa menghitung
  // acaranya belum berakhir sementara blok di bawahnya sudah — dua bacaan jam
  // yang berbeda dalam satu render. Pola yang sama dipakai halaman daftar.
  const now = new Date().toISOString();

  // Penyelenggara bisa orang ATAU pusat layanan, dan yang dicari hanya satu
  // sesuai `host.kind` — bukan dua-duanya lalu dipilih. Slug penyelenggara
  // dijaga harness untuk kedua kind, jadi `null` di sini seharusnya tidak pernah
  // terjadi; `EventHostCard` tetap punya jalan keluarnya kalau terjadi juga.
  const [professional, centre, related] = await Promise.all([
    event.host.kind === "professional"
      ? getProfessionalBySlug(event.host.slug)
      : Promise.resolve(null),
    event.host.kind === "centre"
      ? getCareCentreBySlug(event.host.slug)
      : Promise.resolve(null),
    getRelatedEvents(event.slug, now),
  ]);

  return (
    <EventDetail
      event={event}
      host={{ professional, centre }}
      related={related}
      now={now}
    />
  );
}
