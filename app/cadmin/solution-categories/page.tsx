import TaxonomyManager from "../_components/TaxonomyManager";

export default function SolutionCategoriesPage() {
  return (
    <TaxonomyManager
      title="Solution Categories"
      description="Categories used to group solutions in the directory. Theme drives the card colour."
      endpoint="/api/cadmin/solution-categories"
      itemLabel="Solution category"
      placeholder="Employee Assistance Programme"
      withTheme
      withOrder
    />
  );
}
