import type { Metadata } from "next";
import CareCentres from "./CareCentres";
import { getCareCentreFacets, getCareCentres } from "./data/careCentres";

export const metadata: Metadata = {
  title: "Care Centres",
  description:
    "Clinics, hospitals, and counselling centres for mental health across Indonesia.",
};
export const revalidate = 300;

export default async function CareCentresPage() {
  const now = new Date().toISOString();

  const [centres, facets] = await Promise.all([
    getCareCentres(),
    getCareCentreFacets(),
  ]);

  return <CareCentres centres={centres} facets={facets} now={now} />;
}
