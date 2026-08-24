"use client";

import { useMemo, useState } from "react";
import { CalendarRange, Monitor, Tag, Wallet } from "lucide-react";
import Container from "@/app/components/reusable/Container";
import FilterBar, {
  type FilterBarField,
} from "@/app/components/reusable/FilterBar";
import PageHero from "@/app/components/reusable/PageHero";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import { Blob, SquiggleOrnament } from "@/app/components/reusable/Ornaments";
import EventsCardGrid from "./section/EventsCardGrid";
import { hasEnded } from "./data/eventTime";
import type { EventFacets, MindcareEvent } from "./type/event";
import SearchBar from "../../components/reusable/SearchBar";

const ALL = "all";

const WHEN_UPCOMING = "upcoming";
const WHEN_PAST = "past";
const WHEN_ALL = "all";

const PRICE_FREE = "free";
const PRICE_PAID = "paid";

const whenHeadings: Record<string, string> = {
  [WHEN_UPCOMING]: "Upcoming events",
  [WHEN_PAST]: "Past events",
  [WHEN_ALL]: "All events",
};

type EventsProps = {
  events: MindcareEvent[];
  facets: EventFacets;
  now: string;
};

export default function Events({ events, facets, now }: EventsProps) {
  const [when, setWhen] = useState(WHEN_UPCOMING);
  const [category, setCategory] = useState(ALL);
  const [format, setFormat] = useState(ALL);
  const [price, setPrice] = useState(ALL);
  const [query, setQuery] = useState("");

  const visibleEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      const ended = hasEnded(event, now);
      if (when === WHEN_UPCOMING && ended) return false;
      if (when === WHEN_PAST && !ended) return false;
      if (category !== ALL && event.category.slug !== category) return false;
      if (format !== ALL && event.format !== format) return false;
      if (price === PRICE_FREE && event.price !== 0) return false;
      if (price === PRICE_PAID && event.price === 0) return false;
      return true;
    });

    return when === WHEN_PAST ? filtered.reverse() : filtered;
  }, [events, when, category, format, price, now]);

  const isFiltered =
    when !== WHEN_UPCOMING ||
    category !== ALL ||
    format !== ALL ||
    price !== ALL;

  function resetAll() {
    setQuery("");
    setWhen(WHEN_UPCOMING);
    setCategory(ALL);
    setFormat(ALL);
    setPrice(ALL);
  }

  const fields: FilterBarField[] = [
    {
      id: "when",
      label: "When",
      icon: CalendarRange,
      value: when,
      onValueChange: setWhen,
      options: [
        { value: WHEN_UPCOMING, label: "Upcoming" },
        { value: WHEN_PAST, label: "Past" },
        { value: WHEN_ALL, label: "All dates" },
      ],
    },
    {
      id: "category",
      label: "Category",
      icon: Tag,
      value: category,
      onValueChange: setCategory,
      options: [
        { value: ALL, label: "All categories" },
        ...facets.categories.map((item) => ({
          value: item.slug,
          label: item.name,
        })),
      ],
    },
    {
      id: "format",
      label: "Format",
      icon: Monitor,
      value: format,
      onValueChange: setFormat,
      options: [
        { value: ALL, label: "All formats" },
        ...facets.formats.map((item) => ({ value: item, label: item })),
      ],
    },
    {
      id: "price",
      label: "Price",
      icon: Wallet,
      value: price,
      onValueChange: setPrice,
      options: [
        { value: ALL, label: "All prices" },
        { value: PRICE_FREE, label: "Free" },
        { value: PRICE_PAID, label: "Paid" },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Events"
        title="Find an event to join"
        subtitle="Webinars, workshops, training, and support groups run by the professionals and centres in this directory online and in person, some of them free."
        ornament={
          <>
            <Blob
              tone="lavender"
              className="absolute -left-20 -top-24 size-72 opacity-70"
            />
            <Blob
              tone="mint"
              className="absolute -right-10 top-24 size-56 opacity-60"
            />

            <SquiggleOrnament className="absolute right-8 top-16 hidden w-64 lg:block" />
          </>
        }
      >
        <SearchBar
          value={query}
          onValueChange={setQuery}
          placeholder="Search by centre, city, or service..."
        />
      </PageHero>

      <Container as="section" className="pb-20">
        <FilterBar
          fields={fields}
          onReset={isFiltered ? resetAll : undefined}
        />
        <div className="my-8 mx-4">
          <SectionHeader
            title={whenHeadings[when] ?? "Events"}
            description={`Showing ${visibleEvents.length} of ${events.length} events.`}
          />
        </div>

        <EventsCardGrid events={visibleEvents} now={now} className="mt-8" />
      </Container>
    </div>
  );
}
