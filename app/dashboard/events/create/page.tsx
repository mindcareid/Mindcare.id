import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import CreateEventForm from "./CreateEventForm";

export const metadata: Metadata = {
  title: "Create event",
};

export const dynamic = "force-dynamic";

export default async function CreateEventPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth?tab=login&callbackUrl=/dashboard/events/create");
  }
  const userId = Number(session.user.id);

  const rawType = searchParams.type;
  const rawId = searchParams.id;
  if (typeof rawType !== "string" || typeof rawId !== "string") notFound();

  const listingId = Number(rawId);
  if (!Number.isInteger(listingId) || listingId <= 0) notFound();

  // Verifikasi kepemilikan listing
  let listingName = "";
  if (rawType === "professional") {
    const pro = await prisma.professional.findFirst({
      where: { id: listingId, userId, listingStatus: "LISTED", deletedAt: null },
      select: { fullName: true },
    });
    if (!pro) notFound();
    listingName = pro.fullName;
  } else if (rawType === "care-centre") {
    const mem = await prisma.careCentreUser.findFirst({
      where: { userId, status: "ACTIVE" },
      select: { centre: { select: { id: true, name: true } } },
    });
    if (!mem || mem.centre.id !== listingId) notFound();
    listingName = mem.centre.name;
  } else if (rawType === "solution") {
    const sol = await prisma.solution.findFirst({
      where: { id: listingId, ownerUserId: userId, listingStatus: "LISTED", deletedAt: null },
      select: { name: true },
    });
    if (!sol) notFound();
    listingName = sol.name;
  } else {
    notFound();
  }

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
          Create event
        </p>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          New event for
        </h1>
        <p className="text-base text-muted-foreground">{listingName}</p>
        <p className="text-sm text-muted-foreground">
          Events go live immediately — no separate approval needed.
        </p>
      </header>

      <CreateEventForm
        type={rawType as "professional" | "care-centre" | "solution"}
        listingId={listingId}
        categories={categories}
        industries={industries}
      />
    </div>
  );
}
