import { EventCardSkeletonItem } from "./CardSkeleton";
import EventCard from "./EventCard";

import type { EventCardItem } from "@/lib/events/types";

type Props = {
  events: EventCardItem[];
  totalEvents: number;
  loading?: boolean;
  isFetching?: boolean;
};

export default function EventsGrid({ events, loading, isFetching }: Props) {
  if (loading) {
    return (
      <section className="py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeletonItem key={i} />
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {events.length > 0 ? (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6  duration-200 `}
          >
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg
                className="mx-auto w-24 h-24 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No events found
            </h3>
            <p className="text-gray-500">
              Try changing the filter or your search keywords
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
