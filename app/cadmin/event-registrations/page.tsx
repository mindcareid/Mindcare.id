import EventRegistrationsManager from "./components/EventRegistrationsManager";

export const metadata = { title: "Event Registrations — Admin" };

export default function EventRegistrationsPage({
  searchParams,
}: {
  searchParams?: { eventId?: string };
}) {
  const raw = Number(searchParams?.eventId);
  const initialEventId = Number.isInteger(raw) && raw > 0 ? String(raw) : "";

  return <EventRegistrationsManager initialEventId={initialEventId} />;
}
