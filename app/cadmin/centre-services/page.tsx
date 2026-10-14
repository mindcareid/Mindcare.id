import TaxonomyManager from "../_components/TaxonomyManager";

export default function CentreServicesPage() {
  return (
    <TaxonomyManager
      title="Centre Services"
      description="Services that care centres can offer on their profile."
      endpoint="/api/cadmin/centre-services"
      itemLabel="Centre service"
      placeholder="Psychotherapy"
    />
  );
}
