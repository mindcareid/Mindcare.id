
"use client";

import { useEffect } from "react";

export default function SponsorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SponsorError]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="space-y-5 rounded-xl border border-border bg-card p-8 shadow-card">
        <h1 className="text-2xl font-semibold">
          Temporarily Unavailable
        </h1>

        <p className="text-sm leading-6 text-muted-foreground">
          Something went wrong while loading this page.
          Please try again in a few minutes.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
