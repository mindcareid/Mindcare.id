import EventForm from "../components/EventForm";

/* ================= FETCHERS ================= */

async function getCategories() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/event-categories`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  const json = await res.json();
  return json.data;
}

/* ================= PAGE ================= */

export default async function CreateEventPage() {
  const categories = await getCategories();

  return (
    <div className="p-6">
      <EventForm categories={categories} />
    </div>
  );
}
