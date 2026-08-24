import type { Metadata } from "next";
import Solutions from "./Solutions";
import { getSolutionPartners, getSolutions } from "./data/solutions";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Mental-health programmes for individuals, workplaces, and communities across Indonesia.",
};

export default async function SolutionsPage() {
  const [solutions, partners] = await Promise.all([
    getSolutions(),
    getSolutionPartners(),
  ]);

  return <Solutions solutions={solutions} partners={partners} />;
}
