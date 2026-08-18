import AttendeeFieldForm from "../components/AttendeeFieldsForm";

export default function CreateAttendeeField({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="bg-gray-50 min-h-screen px-4 py-10">
      <div className="container mx-auto">
        <AttendeeFieldForm eventId={Number(params.id)} key={params.id} />
      </div>
    </div>
  );
}