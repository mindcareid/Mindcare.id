import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CreateEventForm from "@/app/components/events/CreateEventForm";

export default async function CreateEventCompany() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const userId = Number(session.user.id);

  const member = await prisma.companyUser.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { companyId: true, role: true },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    redirect("/company/dashboard");
  }

  const [categoriesRes, industries] = await Promise.all([
    fetch(`${process.env.NEXTAUTH_URL}/api/event-categories`, {
      cache: "no-store",
    }).then((r) => r.json()),

    prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const categories = categoriesRes.data as { id: number; name: string }[];

  return (
    <div className="mx-auto mb-10 max-w-3xl lg:max-w-4xl px-4 ">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Create a New Event
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl">
          Enter the details below to set up your event.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-8 shadow-sm">
        <CreateEventForm
          companyId={String(member.companyId)}
          categories={categories}
          industries={industries}
        />
      </div>
    </div>
  );
}
