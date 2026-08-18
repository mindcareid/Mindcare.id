import AttendeeFieldForm from "../../components/AttendeeFieldsForm";

export default async function EditAttendeeField({
  params,
}: {
  params: { id: string; fieldId: string };
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/cadmin/events/${params.id}/attendee-fields/${params.fieldId}`,
    { cache: "no-store" }
  );

  const field = await res.json();

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-10">
      <div className="container mx-auto">
        <AttendeeFieldForm
          eventId={Number(params.id)}
          fieldId={params.fieldId}
          defaultValues={{
            label: field.label,
            type: field.type,
            required: field.required,
            options: field.options || [],
          }}
        />
      </div>
    </div>
  );
}