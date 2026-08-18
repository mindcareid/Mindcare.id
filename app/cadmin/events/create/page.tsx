import EventForm from "../components/EventForm";

/* ================= FETCHERS ================= */

async function getCompanies() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/cadmin/companies`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch companies");
  }

  const json = await res.json();
  return json.data;
}

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
  const [companies, categories] = await Promise.all([
    getCompanies(),
    getCategories(),
  ]);

  return (
    <div className="p-6">
      <EventForm
        companies={companies}
        categories={categories}
      />
    </div>
  );
}
