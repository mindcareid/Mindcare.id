import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils/FormatDate";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import ListingStatusBadge, {
  type ListingStatusValue,
} from "../components/listing/ListingStatusBadge";
import ListingEmptyState from "../components/listing/ListingEmptyState";
import Image from "next/image";
export const metadata: Metadata = {
  title: "My solutions",
  description: "The solutions your account has listed in MindCare.id.",
};

export const dynamic = "force-dynamic";

export default async function DashboardSolutionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth?tab=login&callbackUrl=/dashboard/solution");
  }

  const solutions = await prisma.solution.findMany({
    where: { ownerUserId: Number(session.user.id), deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      organizationName: true,
      logo: true,
      listingStatus: true,
      
      createdAt: true,
      verificationCheckedOn: true,
      verificationValidUntil: true,
      verificationNote: true,
      category: { select: { name: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
            Solutions
          </p>
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            My solution
          </h1>
          <p className="text-sm text-muted-foreground">
            One account can list one solution — it works like a company
            profile. Your listing is reviewed before it appears in the
            directory.
          </p>
        </div>
        {solutions.length > 0 ? (
          <Link
            href={`/dashboard/solution/${solutions[0].id}/edit`}
            className={buttonStyles({ size: "md" })}
          >
            <Pencil className="h-4 w-4" />
            Edit listing
          </Link>
        ) : null}
      </header>

      {solutions.length === 0 ? (
        <ListingEmptyState entity="solution" />
      ) : (
        <div className="space-y-4">
          {solutions.map((solution) => (
            <article
              key={solution.id}
              className="rounded-xl border border-border bg-card p-5 shadow-card md:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 gap-4">
                  {solution.logo ? (
                    <Image
                      src={solution.logo}
                      alt={solution.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover"
                    />
                  ) : null}
                  <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-lg font-semibold text-foreground">
                      {solution.name}
                    </h2>
                    <ListingStatusBadge
                      status={solution.listingStatus as ListingStatusValue}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {solution.organizationName} · {solution.category.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDate(solution.createdAt)}
                    {solution.verificationCheckedOn
                      ? ` · reviewed ${formatDate(solution.verificationCheckedOn)}`
                      : ""}
                    {solution.verificationValidUntil
                      ? ` · valid until ${formatDate(solution.verificationValidUntil)}`
                      : ""}
                  </p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/solution/${solution.id}/edit`}
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </div>

              {solution.listingStatus === "REJECTED" &&
              solution.verificationNote ? (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-destructive">
                    Reason from the review
                  </p>
                  <p className="mt-1.5 text-sm text-foreground">
                    {solution.verificationNote}
                  </p>
                </div>
              ) : null}

              {solution.listingStatus === "PENDING" ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  We are checking the details you submitted. Nothing is public
                  yet.
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
