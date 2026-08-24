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
    <SolutionDetail solution={solution} lead={lead} related={related} />
  );
}
