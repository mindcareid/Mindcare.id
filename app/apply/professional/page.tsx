import type { Metadata } from "next";
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
  const areas = await prisma.areaOfSupport.findMany({
    where: { isActive: true },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

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
        <ProfessionalForm areas={areas} />
      </div>
    </Container>
  );
}
