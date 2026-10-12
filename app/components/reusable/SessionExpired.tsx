import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { buttonStyles } from "./buttonStyles";

export default function SessionExpired({
  callbackUrl = "/",
  title = "Your session has ended",
}: {
  callbackUrl?: string;
  title?: string;
}) {
  const loginHref = `/auth/login?callbackUrl=${encodeURIComponent(
    callbackUrl,
  )}`;

  return (
    <section
      role="alert"
      className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center"
    >
      <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-lavender-100 text-secondary">
        <ShieldAlert className="size-8" />
      </span>

      <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground">
        {title}
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        For your security you were signed out, usually because your session
        expired or you signed in on another device. Sign in again to continue
        where you left off.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href={loginHref} className={buttonStyles({ size: "lg" })}>
          Sign in again
        </Link>
        <Link
          href="/"
          className={buttonStyles({ variant: "outline", size: "lg" })}
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
