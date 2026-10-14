import TaxonomyManager from "../_components/TaxonomyManager";

export default function AreasOfSupportPage() {
  return (
    <TaxonomyManager
      title="Areas of Support"
      description="Topics and concerns used to tag professionals and solutions."
      endpoint="/api/cadmin/areas-of-support"
      itemLabel="Area of support"
      placeholder="Anxiety"
    />
  );
}
