import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import CreateEventForm from "../../create/CreateEventForm";

export const metadata: Metadata = {
  title: "Edit event",
};

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/auth?tab=login&callbackUrl=/dashboard/events`);
  }

  const eventId = Number(params.id);
  if (!Number.isInteger(eventId) || eventId <= 0) notFound();

  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
    include: {
      category: { select: { id: true } },
      industries: { select: { industryId: true } },
    },
  });
  if (!event) notFound();

  // Cek kepemilikan
  const userId = Number(session.user.id);
  const isOwner = await verifyEventOwner(event, userId);
  if (!isOwner) redirect("/dashboard/events");

  const categories = await prisma.eventCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const industries = await prisma.industry.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
          Edit event
        </p>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {event.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Changes save immediately. You can edit any field.
        </p>
      </header>

      <CreateEventForm
        event={event}
        categories={categories}
        industries={industries}
      />
    </div>
  );
}

async function verifyEventOwner(
  event: {
    professionalId: number | null;
    careCentreId: number | null;

  },
  userId: number,
): Promise<boolean> {
  const userIdNum = userId;
  if (event.professionalId) {
    const pro = await prisma.professional.findFirst({
      where: { id: event.professionalId, userId: userIdNum, deletedAt: null },
      select: { id: true },
    });
    return pro !== null;
  }
  if (event.careCentreId) {
    const mem = await prisma.careCentreUser.findFirst({
      where: { centreId: event.careCentreId, userId: userIdNum },
      select: { id: true },
    });
    return mem !== null;
  }
  if (/*solutionId*/0) {
    const sol = await prisma.solution.findFirst({
      where: { id: /*solutionId*/0, ownerUserId: userIdNum, deletedAt: null },
      select: { id: true },
    });
    return sol !== null;
  }
  return false;
}
