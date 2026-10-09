import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Container from "@/app/components/reusable/Container";
import ProfessionalForm from "./ProfessionalForm";

export const metadata: Metadata = {
  title: "Apply as a professional",
  description:
    "Submit your practice details and licence information to apply for a listing in the MindCare.id professional directory.",
};

export const dynamic = "force-dynamic";

export default async function ApplyProfessionalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/apply/professional");
  }

  const userId = Number(session.user.id);
  const [areas, existing] = await Promise.all([
    prisma.areaOfSupport.findMany({
      where: { isActive: true },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.professional.findUnique({
      where: { userId },
      select: { slug: true, fullName: true, listingStatus: true },
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
            Apply as a professional
          </h1>
          <p className="text-base text-muted-foreground">
            This form is for psychologists, psychiatrists, and counsellors who
            practise independently. Your profile stays private until we have
            checked your practice licence.
          </p>
        </header>
        <ProfessionalForm areas={areas} existing={existing} />
      </div>
    </Container>
  );
}
