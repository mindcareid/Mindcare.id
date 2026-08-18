import { EventCardItem } from "@/lib/events";
import EventCardSkeleton from "../../events/section/CardSkeleton";
import EventLandscape from "./EventLandscape";
type Props = {
  events: EventCardItem[];
  totalEvents: number;
  loading?: boolean;
};

export default function HeroEvent({ events, loading }: Props) {
  if (loading) {
    <section className="py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </section>;
  }

  return (
    <div className="py-10 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {events.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <EventLandscape key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
