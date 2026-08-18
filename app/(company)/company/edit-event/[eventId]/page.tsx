import EditEventForm from "@/app/components/events/UpdateEventForm";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: { eventId: string };
};

export default async function EditEventPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) redirect("/auth/login");

  const userId = Number(session.user.id);
  const eventId = Number(params.eventId);

  if (isNaN(eventId)) notFound();

  const member = await prisma.companyUser.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    select: {
      companyId: true,
      role: true,
    },
  });

  if (!member) redirect("/");

  const [event, categories, industries] = await Promise.all([
    prisma.event.findFirst({
      where: {
        id: eventId,
        companyId: member.companyId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        timeZone: true,
        price: true,
        quota: true,
        externalUrl: true,
        coverImage: true,
        publicId: true,
        categoryId: true,
        isPublished: true,
        industries: {
          select: { industryId: true },
        },
      },
    }),
    prisma.eventCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.industry.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!event) notFound();

 
  const selectedIndustryIds = event.industries.map((i) => i.industryId);

  return (
    <div className="mx-auto max-w-3xl lg:max-w-4xl px-4 ">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Edit Event
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl">
          Make changes to your event information below.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-8 shadow-sm">
        <EditEventForm
          companyId={String(member.companyId)}
          event={{
            ...event,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
          }}
          role={member.role}
          categories={categories}
          initialIndustryIds={selectedIndustryIds}
          industries={industries}
        />
      </div>
    </div>
  );
}
