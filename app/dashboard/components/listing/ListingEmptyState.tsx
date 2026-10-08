import Link from "next/link";
import { ArrowRight, Boxes, Building2, UserRoundPlus } from "lucide-react";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

type ListingEntity = "professional" | "care-centre" | "solution";

export default function ListingEmptyState({
  entity,
}: {
  entity: ListingEntity;
}) {
  const copy = copyFor(entity);

  return (
    <section className="rounded-xl border border-border bg-card p-8 text-center shadow-card md:p-12">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-lavender-100 text-secondary">
        <copy.Icon className="h-7 w-7" />
      </span>
      <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
        {copy.title}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
        {copy.description}
      </p>
      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href={copy.href} className={buttonStyles({ size: "lg" })}>
          {copy.actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/help/verification-policy"
          className={buttonStyles({ variant: "outline", size: "lg" })}
        >
          How verification works
        </Link>
      </div>
    </section>
  );
}

function copyFor(entity: ListingEntity) {
  if (entity === "professional") {
    return {
      Icon: UserRoundPlus,
      title: "You are not listed as a professional yet",
      description:
        "Psychologists, psychiatrists, and counsellors can apply to be listed. We check your practice licence before anything becomes public.",
      href: "/apply/professional",
      actionLabel: "Apply as a professional",
    };
  }

  if (entity === "solution") {
    return {
      Icon: Boxes,
      title: "You have not listed a solution yet",
      description:
        "Products, services, programmes, and technologies that support mental health can be listed here. We check the details against the evidence you provide before anything becomes public.",
      href: "/apply/solution",
      actionLabel: "List your solution",
    };
  }

  return {
    Icon: Building2,
    title: "You have not registered a care centre yet",
    description:
      "Clinics, hospitals, and counselling centres can apply to be listed. We check the operating permit and your role at the centre before anything becomes public.",
    href: "/apply/care-centre",
    actionLabel: "Register a care centre",
  };
}
