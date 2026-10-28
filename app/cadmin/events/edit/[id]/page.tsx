import { cookies } from "next/headers";
import EventForm from "../../components/EventForm";

// Halaman edit tidak boleh disajikan dari cache: isinya data yang baru saja
// diubah admin, dan `cookies()` sudah membuatnya dinamis — ini menegaskannya
// supaya tidak ada lapisan cache lain yang menyajikan versi lama.
export const dynamic = "force-dynamic";

/* ================= FETCHERS ================= */

async function getEvent(id: string) {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/cadmin/events?id=${id}`,
    { cache: "no-store", headers: { cookie: cookies().toString() } },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch event");
  }

  return res.json();
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
  const [event, categories] = await Promise.all([
    getEvent(params.id),
    getCategories(),
  ]);

  return (
    <div className="p-6">
      <EventForm
        id={event.data.id}
        defaultValues={event.data}
        categories={categories}
      />
    </div>
  );
}
