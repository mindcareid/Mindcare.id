import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SolutionForm from "@/app/apply/solution/SolutionForm";

export const metadata: Metadata = {
  title: "Edit my solution",
};

export const dynamic = "force-dynamic";

export default async function EditSolutionPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/auth?tab=login&callbackUrl=/dashboard/solution/${params.id}/edit`);
  }

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const solution = await prisma.solution.findFirst({
    where: { id, ownerUserId: Number(session.user.id), deletedAt: null },
    include: {
      category: { select: { slug: true } },
      audiences: { select: { audience: { select: { slug: true } } } },
      focusAreas: { select: { area: { select: { slug: true } } } },
    },
  });
  if (!solution) notFound();

  const [categories, audiences, areas] = await Promise.all([
    prisma.solutionCategory.findMany({
      where: { isActive: true },
      select: { slug: true, name: true },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.solutionAudience.findMany({
      where: { isActive: true },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.areaOfSupport.findMany({
      where: { isActive: true },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-8">
      <header className="space-y-3">
        <Link
          href="/dashboard/solution"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to my solutions
        </Link>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
          Edit listing
        </p>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {solution.name}
        </h1>
      </header>

      <SolutionForm
        categories={categories}
        audiences={audiences}
        areas={areas}
        solutionId={solution.id}
        initialValues={{
          organizationName: solution.organizationName,
          name: solution.name,
          tagline: solution.tagline ?? "",
          description: solution.description ?? "",
          categorySlug: solution.category.slug,
          audienceSlugs: solution.audiences.map((entry) => entry.audience.slug),
          focusSlugs: solution.focusAreas.map((entry) => entry.area.slug),
          deliveryFormat: "Online" as const,
          serviceArea: "" as string,
          featuresText: "",
          evidence: [{ label: "", url: "" }],
          website: solution.website ?? "",
          brochureUrl: "" as string,
          videoUrl: "" as string,
          contactEmail: solution.contactEmail ?? "",
          contactPhone: solution.contactPhone ?? "",
          logo: solution.logo ?? "",
          logoPublicId: solution.logoPublicId ?? "",
          coverImage: solution.coverImage ?? "",
          coverPublicId: solution.coverPublicId ?? "",
        }}
      />
    </div>
  );
}
