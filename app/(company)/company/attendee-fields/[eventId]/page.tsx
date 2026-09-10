import AttendeeFieldsForm from "@/app/components/events/AttendeFieldsForm";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
type Props = {
  params: { eventId: string };
};

export default async function AttendeeFieldsCompany({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) redirect("/auth/login");
  const member = await prisma.companyUser.findFirst({
    where: {
      userId: Number(session.user.id),
      status: "ACTIVE",
    },
  });
  if (!member) redirect("/");

  const event = await prisma.event.findFirst({
    where: {
      id: Number(params.eventId),
      companyId: member.companyId,
      deletedAt: null,
    },
  });

  if (!event) notFound();
  const fields = await prisma.eventAttendeeField.findMany({
    where: { eventId: event.id },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">
          Attendee Fields
        </p>
        <h1 className="text-2xl font-semibold text-gray-900">{event.title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add extra fields for attendees to fill out during registration.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <AttendeeFieldsForm
          companyId={String(member.companyId)}
          eventId={String(event.id)}
          initialFields={fields.map((f) => ({
            id: f.id,
            label: f.label,
            key: f.key,
            type: f.type as any,
            required: f.required,
            options: (f.options as string[]) ?? [],
            order: f.sortOrder,
          }))}
        />
      </div>
    </div>
  );
}
