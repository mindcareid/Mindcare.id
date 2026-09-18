import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EditCareCentreForm from "./EditCareCentreForm";

export const metadata: Metadata = {
  title: "Edit my care centre",
};

export const dynamic = "force-dynamic";

const KIND_FROM_ENUM = {
  KLINIK: "Klinik",
  RUMAH_SAKIT: "Rumah Sakit",
  PUSKESMAS: "Puskesmas",
  PUSAT_KONSELING: "Pusat Konseling",
} as const;

export default async function EditCareCentrePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth?tab=login&callbackUrl=/dashboard/care-centre/edit");
  }

  const membership = await prisma.careCentreUser.findFirst({
    where: { userId: Number(session.user.id) },
    orderBy: { createdAt: "desc" },
    include: {
      centre: {
        include: {
          openingHours: { orderBy: { day: "asc" } },
          services: { select: { service: { select: { slug: true } } } },
        },
      },
    },
  });
  if (!membership) notFound();
  const centre = membership.centre;

  const serviceOptions = await prisma.service.findMany({
    where: { isActive: true },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

  const hoursByDay = new Map(centre.openingHours.map((h) => [h.day, h]));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
          Edit listing
        </p>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {centre.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Changes to the centre name, type, address, or permit put the listing
          back under review and hide it from the directory until it is approved
          again. Everything else saves immediately.
        </p>
      </header>

      <EditCareCentreForm
        services={serviceOptions}
        initialValues={{
          name: centre.name,
          kind: KIND_FROM_ENUM[centre.kind],
          description: centre.description ?? "",
          street: centre.street,
          city: centre.city,
          province: centre.province,
          postalCode: centre.postalCode,
          phone: centre.phone,
          website: centre.website ?? "",
          acceptsBpjs: centre.acceptsBpjs,
          // Database menyimpan string bebas; form hanya mengenal tiga zona.
          // Nilai di luar daftar jatuh ke WIB — bukan dikarang, tapi pilihan
          // yang terlihat dan bisa diubah pemiliknya.
          timeZone: (
            ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"] as const
          ).includes(
            centre.timeZone as "Asia/Jakarta" | "Asia/Makassar" | "Asia/Jayapura",
          )
            ? (centre.timeZone as
                | "Asia/Jakarta"
                | "Asia/Makassar"
                | "Asia/Jayapura")
            : "Asia/Jakarta",
          openingNote: centre.openingNote ?? "",
          openingHours: [1, 2, 3, 4, 5, 6, 7].map((day) => {
            const hour = hoursByDay.get(day);
            return {
              day: day as 1 | 2 | 3 | 4 | 5 | 6 | 7,
              opens: hour?.opens ?? "",
              closes: hour?.closes ?? "",
            };
          }),
          serviceSlugs: centre.services.map((entry) => entry.service.slug),
          permitType: centre.permitType ?? "",
          permitNumber: centre.permitNumber ?? "",
          permitValidUntil:
            centre.permitValidUntil?.toISOString().slice(0, 10) ?? "",
        }}
      />
    </div>
  );
}
