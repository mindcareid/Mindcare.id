"use client";

import { useMemo, useState } from "react";
import { Building2, CalendarClock, MapPin, Stethoscope } from "lucide-react";
import Container from "@/app/components/reusable/Container";
import FilterBar, {
  type FilterBarField,
} from "@/app/components/reusable/FilterBar";
import PageHero from "@/app/components/reusable/PageHero";
import SearchBar from "@/app/components/reusable/SearchBar";
import CareCentresGrid from "./section/CareCentresGrid";
import CentresMapPlaceholder from "./section/CentresMapPlaceholder";
import type { CareCentre, CareCentreFacets } from "./type/careCentre";

// Satu-satunya client component di fitur ini. `page.tsx` tetap server component
// yang memanggil accessor lalu menurunkannya sebagai props (rules.md pasal 4).
//
// Filternya SINGLE-SELECT, berbeda dari Professionals yang multi-select. Itu
// bukan kelalaian: `FilterBar` di mockup berbentuk deretan field dengan satu
// nilai terbaca per field, sedangkan `FilterSidebar` Professionals berbentuk
// accordion dengan kotak centang. Bentuknya memang menyiratkan semantik berbeda.
const ALL = "all";
const ANY_TIME = "any";
const OPEN_NOW = "open";

function matchesQuery(centre: CareCentre, query: string) {
  const haystack = [
    centre.name,
    centre.kind,
    centre.address.street,
    centre.address.city,
    centre.address.province,
    ...centre.services.map((service) => service.name),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

type CareCentresProps = {
  centres: CareCentre[];
  facets: CareCentreFacets;
};

export default function CareCentres({ centres, facets }: CareCentresProps) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(ALL);
  const [kind, setKind] = useState(ALL);
  const [service, setService] = useState(ALL);
  const [availability, setAvailability] = useState(ANY_TIME);

  const visibleCentres = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase();

    return centres.filter((centre) => {
      if (normalisedQuery !== "" && !matchesQuery(centre, normalisedQuery)) {
        return false;
      }
      if (city !== ALL && centre.address.city !== city) return false;
      if (kind !== ALL && centre.kind !== kind) return false;
      if (
        service !== ALL &&
        !centre.services.some((item) => item.slug === service)
      ) {
        return false;
      }
      if (availability === OPEN_NOW && !centre.isOpenNow) return false;
      return true;
    });
  }, [centres, query, city, kind, service, availability]);

  const isFiltered =
    query.trim() !== "" ||
    city !== ALL ||
    kind !== ALL ||
    service !== ALL ||
    availability !== ANY_TIME;

  function resetAll() {
    setQuery("");
    setCity(ALL);
    setKind(ALL);
    setService(ALL);
    setAvailability(ANY_TIME);
  }

  // Pilihan filter dibangun dari facet yang diturunkan dari data, bukan didaftar
  // manual di sini — jadi pusat layanan baru dengan layanan baru langsung ikut
  // muncul tanpa menyunting komponen.
  const fields: FilterBarField[] = [
    {
      id: "city",
      label: "City",
      icon: MapPin,
      value: city,
      onValueChange: setCity,
      options: [
        { value: ALL, label: "All cities" },
        ...facets.cities.map((name) => ({ value: name, label: name })),
      ],
    },
    {
      id: "kind",
      label: "Type",
      icon: Building2,
      value: kind,
      onValueChange: setKind,
      options: [
        { value: ALL, label: "All types" },
        ...facets.kinds.map((name) => ({ value: name, label: name })),
      ],
    },
    {
      id: "service",
      label: "Service",
      icon: Stethoscope,
      value: service,
      onValueChange: setService,
      options: [
        { value: ALL, label: "All services" },
        ...facets.services.map((item) => ({
          value: item.slug,
          label: item.name,
        })),
      ],
    },
    {
      id: "availability",
      label: "Availability",
      icon: CalendarClock,
      value: availability,
      onValueChange: setAvailability,
      options: [
        { value: ANY_TIME, label: "Any time" },
        { value: OPEN_NOW, label: "Open now" },
      ],
    },
  ];

  const mapCaption = `${visibleCentres.length} of ${centres.length} centres shown`;

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Care Centres"
        title="Find a centre near you"
        subtitle="Clinics, hospitals, community health centres, and counselling centres that treat mental health — with the services they offer and the hours they keep."
        media={<CentresMapPlaceholder caption={mapCaption} />}
      >
        <SearchBar
          value={query}
          onValueChange={setQuery}
          placeholder="Search by centre, city, or service..."
        />
      </PageHero>

      <Container as="section" className="pb-20">
        <FilterBar fields={fields} onReset={isFiltered ? resetAll : undefined} />

        <p className="mt-6 text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{visibleCentres.length}</span>{" "}
          of {centres.length} centres
        </p>

        <CareCentresGrid centres={visibleCentres} className="mt-6" />
      </Container>
    </div>
  );
}
