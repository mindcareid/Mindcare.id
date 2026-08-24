import type { Metadata } from "next";
import CareCentres from "./CareCentres";
import { getCareCentreFacets, getCareCentres } from "./data/careCentres";

export const metadata: Metadata = {
  title: "Care Centres",
  description:
    "Clinics, hospitals, and counselling centres for mental health across Indonesia.",
};

export default async function CareCentresPage() {
  const [centres, facets] = await Promise.all([
    getCareCentres(),
    getCareCentreFacets(),
  ]);

  return <CareCentres centres={centres} facets={facets} />;
}
