import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCentreOfProfessional } from "../../care-centres/data/careCentres";
import { getArticles } from "../../insights/data/articles";
import { getEvents } from "../../events/data/events";
import { compareByStartAsc, hasEnded } from "../../events/data/eventTime";
import {
  getProfessionalBySlug,
  getProfessionals,
  getRelatedProfessionals,
} from "../data/professionals";
import ProfessionalProfile from "./ProfessionalProfile";

type ProfessionalPageProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const professionals = await getProfessionals();
  return professionals.map((professional) => ({ slug: professional.slug }));
}

// Halaman ini menyembunyikan acara yang sudah lewat (`hasEnded`), jadi hasilnya
// bergantung pada "sekarang". Dengan `generateStaticParams` di atas, kelima belas
// halaman dirender saat build — tanpa baris ini daftar "Upcoming events" di profil
// akan terus menampilkan acara yang sudah berlalu sampai deploy berikutnya.
//
// Satu jam, mengikuti `/events` dan `/events/[slug]`: acara berakhir sekali,
// tidak berulang-ulang seperti jam buka klinik.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: ProfessionalPageProps): Promise<Metadata> {
  const professional = await getProfessionalBySlug(params.slug);
  if (!professional) return { title: "Professional not found" };

  return {
    title: `${professional.fullName}, ${professional.credentials}`,
    description: professional.headline,
  };
}

export default async function ProfessionalPage({
  params,
}: ProfessionalPageProps) {
  const professional = await getProfessionalBySlug(params.slug);
  if (!professional) notFound();

  const now = new Date().toISOString();

  const [allArticles, allEvents, related, centre] = await Promise.all([
    getArticles(),
    getEvents(),
    getRelatedProfessionals(professional.slug),
    // Relasinya dibaca dari sisi centre (`professionalSlugs`), bukan dari sebuah
    // field di `Professional`. Alasannya di `design.md` bagian 20: satu arah
    // saja, supaya tidak ada dua tempat yang bisa saling bertentangan tentang
    // siapa praktik di mana. `null` berarti orangnya belum terikat centre mana
    // pun, dan bagiannya disembunyikan seluruhnya di `ProfessionalProfile`.
    getCentreOfProfessional(professional.slug),
  ]);

  const articles = allArticles
    .filter((article) => article.author.professionalSlug === professional.slug)
    .slice(0, 3);

  const events = allEvents
    .filter(
      (event) =>
        event.host.kind === "professional" &&
        event.host.slug === professional.slug &&
        !hasEnded(event, now),
    )
    .sort(compareByStartAsc)
    .slice(0, 3);

  return (
    <ProfessionalProfile
      professional={professional}
      centre={centre}
      articles={articles}
      events={events}
      related={related}
      now={now}
    />
  );
}
