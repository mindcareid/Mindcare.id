import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Container from "@/app/components/reusable/Container";
import CareCentreForm from "./CareCentreForm";

export const metadata: Metadata = {
  title: "Register a care centre",
  description:
    "Submit your clinic, hospital, or counselling centre to apply for a listing in the MindCare.id directory.",
};

export const dynamic = "force-dynamic";

export default async function ApplyCareCentrePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/apply/care-centre");
  }

  const userId = Number(session.user.id);
  const [services, membership] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.careCentreUser.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        centre: {
          select: { slug: true, name: true, listingStatus: true },
        },
      },
    }),
  ]);

  return (
    <Container className="py-10 md:py-14">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
            Join the directory
          </p>
          <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
            Register a care centre
          </h1>
          <p className="text-base text-muted-foreground">
            This form is for representatives of clinics, hospitals, and
            counselling centres. The listing stays private until we have checked
            your operating permit and your role at the centre.
          </p>
        </header>
        <CareCentreForm services={services} existing={membership?.centre ?? null} />
      </div>
    </Container>
  );
}
