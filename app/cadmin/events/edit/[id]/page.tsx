import { cookies } from "next/headers";
import EventForm from "../../components/EventForm";
cookies;

/* ================= FETCHERS ================= */

async function getEvent(id: string) {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/cadmin/events?id=${id}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch event");
  }

  return res.json();
}

async function getCompanies() {
  const cookieStore = cookies();
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/cadmin/companies`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch companies");
  }

  const json = await res.json();
  return json.data;
}

async function getCategories() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/event-categories`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  const json = await res.json();
  return json.data;
}

/* ================= PAGE ================= */

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const [event, companies, categories] = await Promise.all([
    getEvent(params.id),
    getCompanies(),
    getCategories(),
  ]);

  return (
    <div className="p-6">
      <EventForm
        id={event.data.id}
        defaultValues={event.data}
        companies={companies}
        categories={categories}
      />
    </div>
  );
}
