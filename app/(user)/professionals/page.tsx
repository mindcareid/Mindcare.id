import type { Metadata } from "next";
import Professionals from "./Professionals";
import { getProfessionalFacets, getProfessionals } from "./data/professionals";

export const metadata: Metadata = {
  title: "Professionals",
  description:
    "Browse verified psychologists, psychiatrists, and counsellors across Indonesia.",
};

export default async function ProfessionalsPage() {
  const [professionals, facets] = await Promise.all([
    getProfessionals(),
    getProfessionalFacets(),
  ]);

  return <Professionals professionals={professionals} facets={facets} />;
}
