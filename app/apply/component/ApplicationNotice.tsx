import Link from "next/link";

const STATUS_COPY: Record<string, { label: string; description: string }> = {
  PENDING: {
    label: "Under review",
    description:
      "We have received your application and are reviewing it. We will contact you when the review is complete.",
  },
  LISTED: {
    label: "Listed",
    description:
      "Your application has been approved and is live in the directory.",
  },
  REJECTED: {
    label: "Rejected",
    description:
      "Your previous application was rejected. Contact us before submitting again.",
  },
};

export default function ApplicationNotice({
  entity,
  name,
  listingStatus,
}: {
  entity: "professional" | "care centre";
  name: string;
  listingStatus: string;
}) {
  const copy = STATUS_COPY[listingStatus] ?? {
    label: "Submitted",
    description: "There is already an application on this account.",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card md:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
        Application
      </p>
      <h2 className="mt-2 font-heading text-2xl font-semibold text-foreground">
        {name}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {entity === "professional"
          ? "Professional application"
          : "Care centre application"}{" "}
        — <span className="font-medium text-foreground">{copy.label}</span>
      </p>
      <p className="mt-4 text-sm text-muted-foreground">{copy.description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to the directory
        </Link>
        <Link
          href="/help/verification-policy"
          className="text-sm font-medium text-primary hover:underline"
        >
          How verification works
        </Link>
      </div>
    </div>
  );
}
