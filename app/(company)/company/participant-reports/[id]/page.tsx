import { redirect, notFound } from "next/navigation";
import { getParticipantsQuerySchema } from "@/lib/validations/auth";
import { requireCompanyEventAccess } from "@/lib/participants/guard";
import { getEventParticipants } from "@/lib/participants/queries";
import ParticipantTable from "../../components/ParticipantTable";
import ExportParticipantsButton from "../../components/ExportButton";
export default async function ParticipantReportPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string; limit?: string; status?: string };
}) {
  const eventId = Number(params.id);
  if (isNaN(eventId)) notFound();

  const access = await requireCompanyEventAccess(eventId);

  if (!access.ok) {
    if (access.status === 401) redirect("/auth/login");
    if (access.status === 404) notFound();
    redirect("/company");
  }
  const parsedQuery = getParticipantsQuerySchema.safeParse(searchParams);
  const query = parsedQuery.success
    ? parsedQuery.data
    : getParticipantsQuerySchema.parse({});

  const result = await getEventParticipants({ eventId, ...query });

  if (!result.event) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl uppercase font-bold text-gray-900">
            {result.event.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {result.meta.total} Transaction
          </p>
        </div>

        <ExportParticipantsButton eventId={eventId} status={query.status} />
      </div>

      <ParticipantTable
        rows={result.data}
        fields={result.fields}
        meta={result.meta}
        currentPage={query.page}
      />
    </div>
  );
}
