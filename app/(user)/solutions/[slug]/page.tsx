import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfessionalBySlug } from "../../professionals/data/professionals";
import {
  getRelatedSolutions,
  getSolutionBySlug,
  getSolutions,
} from "../data/solutions";
import SolutionDetail from "./SolutionDetail";

type SolutionPageProps = {
  params: { slug: string };
};

// Halaman ini merender `SolutionLead`, yang memasang badge verifikasi pemimpin
// programnya — dan badge itu bergantung pada tanggal hari ini. Halaman statis
// membekukan `new Date()` di waktu build, jadi tanpa baris ini badge-nya tidak
// akan pernah kedaluwarsa sampai ada deploy berikutnya.
//
// Satu jam, mengikuti `/professionals/[slug]`: di halaman ini tidak ada yang
// berubah lebih cepat dari itu.
export const revalidate = 3600;

export async function generateStaticParams() {
  const solutions = await getSolutions();
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({
  params,
}: SolutionPageProps): Promise<Metadata> {
  const solution = await getSolutionBySlug(params.slug);
  if (!solution) return { title: "Solution not found" };

  return {
    title: solution.title,
    description: solution.summary,
  };
}

export default async function SolutionPage({ params }: SolutionPageProps) {
  const solution = await getSolutionBySlug(params.slug);
  if (!solution) notFound();

  // Satu acuan waktu untuk seluruh halaman, difiksasi di sini.
  const now = new Date().toISOString();

  // Pemimpin program diambil di sini, bukan lewat accessor baru di folder
  // `professionals/` — pola yang sama dengan halaman detail Professionals,
  // supaya perubahan sesi ini tidak keluar dari folder `solutions/`.
  const [lead, related] = await Promise.all([
    solution.leadProfessionalSlug
      ? getProfessionalBySlug(solution.leadProfessionalSlug)
      : Promise.resolve(null),
    getRelatedSolutions(solution.slug),
  ]);

  return (
    <SolutionDetail
      solution={solution}
      lead={lead}
      related={related}
      now={now}
    />
  );
}
