"use client";

import { useEventsQuery } from "@/app/hooks/useEventsQuery";
import HeroEvent from "../components/hero/EventHero";
import Button from "@/app/components/reusable/Button";
import { FiSearch } from "react-icons/fi";

import {
  DEFAULT_EVENT_FILTERS,
  HOME_EVENTS_LIMIT,
} from "@/lib/events/constants";
import type {
  EventCardItem,
  EventFilters,
  EventMeta,
} from "@/lib/events/types";

type Props = {
  initialEvents: EventCardItem[];
  initialMeta: EventMeta;
};

const ONGOING_FILTERS: EventFilters = {
  ...DEFAULT_EVENT_FILTERS,
  type: "upcoming",
};

export default function HomeEvent({ initialEvents, initialMeta }: Props) {
  const { events, loading } = useEventsQuery(ONGOING_FILTERS, {
    initialEvents,
    initialMeta,
    initialFilters: ONGOING_FILTERS,
    limit: HOME_EVENTS_LIMIT,
  });

  return (
    <div>
      <div className="mb-5 mt-10 flex flex-col items-center gap-2 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
          Upcoming Events
        </h2>
        <span className="h-1 w-12 rounded-full bg-blue-600" />
      </div>

      <div className="flex flex-row gap-4 ">
        <Button variant="primary">Simpan</Button>
        <Button variant="secondary">Clear</Button>

        <Button variant="outline" icon={FiSearch} iconPosition="left">
          spam
        </Button>

        <Button variant="danger" type="submit">
          Hapus
        </Button>
      </div>

      <HeroEvent
        events={events}
        totalEvents={events.length}
        loading={loading}
      />
    </div>
  );
}
