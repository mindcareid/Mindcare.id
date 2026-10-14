import TaxonomyManager from "../_components/TaxonomyManager";

export default function EventFocusAreasPage() {
  return (
    <TaxonomyManager
      title="Event Focus Areas"
      description="Topics used to tag and filter events on the public site."
      endpoint="/api/cadmin/event-focus-areas"
      itemLabel="Focus area"
      placeholder="Anxiety"
    />
  );
}
