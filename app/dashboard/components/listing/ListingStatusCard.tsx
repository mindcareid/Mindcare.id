import { CheckCircle2, Clock, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/FormatDate";
import type { ListingStatusValue } from "./ListingStatusBadge";

const STATUS_PRESENTATION: Record<
  ListingStatusValue,
  {
    icon: typeof Clock;
    iconClassName: string;
    title: string;
    description: string;
    steps: string[];
  }
> = {
  PENDING: {
    icon: Clock,
    iconClassName: "bg-brand-lavender-100 text-secondary",
    title: "Your application is being reviewed",
    description:
      "We have received everything you submitted. Nothing is public yet — a listing only appears in the directory after the review is finished.",
    steps: [
      "We check the documents you sent against the registry.",
      "You will get a notification in this dashboard once a decision is made.",
      "If anything needs fixing, we will tell you exactly what.",
    ],
  },
  LISTED: {
    icon: CheckCircle2,
    iconClassName: "bg-brand-mint-100 text-accent",
    title: "Your listing is live in the directory",
    description:
      "Your application was approved and visitors can now find you in the MindCare.id directory.",
    steps: [
      "Keep the details accurate — tell us if anything changes.",
      "We re-check documents before they expire.",
      "You will be notified before the verification lapses.",
    ],
  },
  REJECTED: {
    icon: XCircle,
    iconClassName: "bg-destructive/10 text-destructive",
    title: "Your application was not approved",
    description:
      "The details below explain why. Read the reason carefully before deciding what to do next.",
    steps: [
      "Fix what the reason asks for.",
      "Get in touch with us if you think the decision was wrong.",
      "You are welcome to apply again once the problem is resolved.",
    ],
  },
};

export default function ListingStatusCard({
  status,
  submittedAt,
  checkedOn,
  validUntil,
  note,
}: {
  status: ListingStatusValue;
  submittedAt: Date;
  checkedOn?: Date | null;
  validUntil?: Date | null;
  note?: string | null;
}) {
  const presentation = STATUS_PRESENTATION[status];
  const Icon = presentation.icon;

  return (
    <section
      className="rounded-xl border border-border bg-card p-5 shadow-card md:p-6"
      aria-label="Application status"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
            presentation.iconClassName,
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {presentation.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {presentation.description}
          </p>
          <p className="text-xs text-muted-foreground">
            Submitted {formatDate(submittedAt)}
            {checkedOn ? ` · reviewed ${formatDate(checkedOn)}` : ""}
            {validUntil ? ` · valid until ${formatDate(validUntil)}` : ""}
          </p>
        </div>
      </div>

      {status === "REJECTED" && note ? (
        <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-destructive">
            Reason from the review
          </p>
          <p className="mt-1.5 text-sm text-foreground">{note}</p>
        </div>
      ) : null}

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          What happens next
        </p>
        <ul className="mt-2 space-y-1.5">
          {presentation.steps.map((step) => (
            <li key={step} className="flex gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
