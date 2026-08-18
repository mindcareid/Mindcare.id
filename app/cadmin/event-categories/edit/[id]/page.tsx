import EventCategoryForm from "../../components/EventCategoryForm";

async function getEventCategory(id: string) {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL ?? ""}/api/event-categories?id=${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch event category");
  }

  return res.json();
}

export default async function EditEventCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getEventCategory(params.id);

  return (
    <div className="p-6">
      <EventCategoryForm
        id={Number(params.id)}
        defaultValues={data.data}
      />
    </div>
  );
}
