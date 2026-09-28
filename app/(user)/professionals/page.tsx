import type { Metadata } from "next";
import Professionals from "./Professionals";
import { getProfessionalFacets, getProfessionals } from "./data/professionals";

export const metadata: Metadata = {
  title: "Professionals",

  description:
    "Browse psychologists, psychiatrists, and counsellors across Indonesia. Each listing shows whether we have checked a practice licence.",
};
export const revalidate = 3600;

export default async function ProfessionalsPage() {
  const now = new Date().toISOString();

  const [professionals, facets] = await Promise.all([
    getProfessionals(),
    getProfessionalFacets(),
  ]);

  return (
    <Professionals professionals={professionals} facets={facets} now={now} />
  );
}
