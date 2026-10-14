import TaxonomyManager from "../_components/TaxonomyManager";

export default function SolutionAudiencesPage() {
  return (
    <TaxonomyManager
      title="Solution Audiences"
      description="Audiences that solutions can target (e.g. individuals, workplaces)."
      endpoint="/api/cadmin/solution-audiences"
      itemLabel="Solution audience"
      placeholder="For Workplaces"
    />
  );
}
