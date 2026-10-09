import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Container from "@/app/components/reusable/Container";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import SolutionForm from "./SolutionForm";

export const metadata: Metadata = {
  title: "List your solution",
  description:
    "Submit a mental-health product, service, programme, or technology to be listed in the MindCare.id solutions directory.",
};

export const dynamic = "force-dynamic";

export default async function ApplySolutionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/apply/solution");
  }

  const existing = await prisma.solution.findFirst({
    where: { ownerUserId: Number(session.user.id), deletedAt: null },
    select: { slug: true, name: true, listingStatus: true },
  });

  if (existing) {
    return (
      <Container className="py-10 md:py-14">
        <div className="mx-auto w-full max-w-2xl space-y-5 rounded-xl border border-border bg-card p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
            Solutions directory
          </p>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            You already have a solution
          </h1>
          <p className="text-sm text-muted-foreground">
            Each account can list one solution — it works like a company
            profile.{" "}
            <span className="font-medium text-foreground">{existing.name}</span>{" "}
            is currently{" "}
            <span className="font-medium text-foreground">
              {existing.listingStatus === "LISTED"
                ? "live in the directory"
                : existing.listingStatus === "PENDING"
                  ? "under review"
                  : "not approved"}
            </span>
            . Edit it from your dashboard instead of creating another one.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/solution"
              className={buttonStyles({ size: "lg" })}
            >
              Go to my solution
            </Link>
            <Link
              href="/help/verification-policy"
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              How verification works
            </Link>
          </div>
        </div>
      </Container>
    );
  }

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
    <Container className="py-10 md:py-14">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
            Solutions directory
          </p>
          <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
            List your solution
          </h1>
          <p className="text-base text-muted-foreground">
            For organisations behind mental-health products, services,
            programmes, and technologies. Your listing stays private until we
            have checked the details against the evidence you provide.
          </p>
        </header>
        <SolutionForm
          categories={categories}
          audiences={audiences}
          areas={areas}
        />
      </div>
    </Container>
  );
}
