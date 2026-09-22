import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/app/components/reusable/Container";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

export const metadata: Metadata = {
  title: "Application received",
  description: "Your application has been received and is waiting for review.",
};

export default function ApplySubmittedPage() {
  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-2xl space-y-6 rounded-xl border border-border bg-card p-8 shadow-card md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
          Application received
        </p>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Thank you — we will take it from here
        </h1>
        <div className="space-y-4 text-base text-muted-foreground">
          <p>
            Your application is now waiting for review. We will check the
            documents you provided and contact you by email when the review is
            complete.
          </p>
          <p>
            Nothing appears in the public directory yet. Listings go live only
            after the review is finished — see{" "}
            <Link
              href="/help/verification-policy"
              className="font-medium text-primary hover:underline"
            >
              how verification works
            </Link>
            .
          </p>
          <p>
            You can follow the status any time from your dashboard, under{" "}
            <span className="font-medium text-foreground">
              My Professional Listing
            </span>{" "}
            or{" "}
            <span className="font-medium text-foreground">My Care Centre</span>.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard" className={buttonStyles({ size: "lg" })}>
            Go to my dashboard
          </Link>
          <Link
            href="/"
            className={buttonStyles({ variant: "outline", size: "lg" })}
          >
            Back to the directory
          </Link>
        </div>
      </div>
    </Container>
  );
}
