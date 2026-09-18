import Link from "next/link";
import { ArrowRight, Building2, UserRoundPlus } from "lucide-react";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

export default function ListingEmptyState({
  entity,
}: {
  entity: "professional" | "care-centre";
}) {
  const isProfessional = entity === "professional";
  const Icon = isProfessional ? UserRoundPlus : Building2;

  return (
    <section className="rounded-xl border border-border bg-card p-8 text-center shadow-card md:p-12">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-lavender-100 text-secondary">
        <Icon className="h-7 w-7" />
      </span>
      <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
        {isProfessional
          ? "You are not listed as a professional yet"
          : "You have not registered a care centre yet"}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
        {isProfessional
          ? "Psychologists, psychiatrists, and counsellors can apply to be listed. We check your practice licence before anything becomes public."
          : "Clinics, hospitals, and counselling centres can apply to be listed. We check the operating permit and your role at the centre before anything becomes public."}
      </p>
      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href={isProfessional ? "/apply/professional" : "/apply/care-centre"}
          className={buttonStyles({ size: "lg" })}
        >
          {isProfessional
            ? "Apply as a professional"
            : "Register a care centre"}
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
