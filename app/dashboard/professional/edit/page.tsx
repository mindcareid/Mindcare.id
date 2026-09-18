import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EditProfessionalForm from "./EditProfessionalForm";

export const metadata: Metadata = {
  title: "Edit my professional listing",
};

export const dynamic = "force-dynamic";

export default async function EditProfessionalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth?tab=login&callbackUrl=/dashboard/professional/edit");
  }

  const professional = await prisma.professional.findUnique({
    where: { userId: Number(session.user.id) },
    include: {
      services: { orderBy: { priceIdr: "asc" } },
      areas: { select: { area: { select: { slug: true } } } },
    },
  });
  if (!professional) notFound();

  const areas = await prisma.areaOfSupport.findMany({
    where: { isActive: true },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
          Edit listing
        </p>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {professional.fullName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Changes to your name, credentials, profession, or licence put the
          listing back under review and hide it from the directory until it is
          approved again. Everything else saves immediately.
        </p>
      </header>

      <EditProfessionalForm
        areas={areas}
        initialValues={{
          fullName: professional.fullName,
          credentials: professional.credentials,
          profession: professional.profession,
          headline: professional.headline,
          bio: professional.bio ?? "",
          baseCity: professional.baseCity,
          baseProvince: professional.baseProvince,
          languages: Array.isArray(professional.languages)
            ? (professional.languages as string[])
            : [],
          yearsOfExperience: professional.yearsOfExperience,
          areaSlugs: professional.areas.map((entry) => entry.area.slug),
          services: professional.services.map((service) => ({
            name: service.name,
            // Enum database → label kontrak (bentuk yang dipakai form).
            mode: service.mode === "ONLINE" ? "Online" : "In Person",
            durationMinutes: service.durationMinutes,
            priceIdr: service.priceIdr,
          })),
          licenceType: professional.licenceType ?? "",
          licenceNumber: professional.licenceNumber ?? "",
          licenceValidUntil:
            professional.licenceValidUntil?.toISOString().slice(0, 10) ?? "",
        }}
      />
    </div>
  );
}
