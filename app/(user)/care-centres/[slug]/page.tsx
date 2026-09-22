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
export const revalidate = 300;

export async function generateMetadata({
  params,
}: CareCentrePageProps): Promise<Metadata> {
  const centre = await getCareCentreBySlug(params.slug);
  if (!centre) return { title: "Care centre not found" };

  return {
    title: centre.name,
    description: `${centre.kind} di ${centre.address.city}, ${centre.address.province}.`,
  };
}

export default async function CareCentrePage({ params }: CareCentrePageProps) {
  const centre = await getCareCentreBySlug(params.slug);
  if (!centre) notFound();
  const now = new Date().toISOString();
  const all = await getProfessionals();
  const bySlug = new Map(all.map((item) => [item.slug, item]));
  const professionals = centre.professionalSlugs
    .map((slug) => bySlug.get(slug))
    .filter((item): item is Professional => item !== undefined);

  return (
    <CareCentreDetail centre={centre} professionals={professionals} now={now} />
  );
}
