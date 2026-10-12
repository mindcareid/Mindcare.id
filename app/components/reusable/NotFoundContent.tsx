import Image from "next/image";
import Link from "next/link";
import { buttonStyles } from "./buttonStyles";

export default function NotFoundContent() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <Image
        src="/images/notfound.webp"
        alt=""
        width={600}
        height={500}
        sizes="(min-width: 640px) 20rem, 80vw"
        className="h-auto w-full max-w-xs"
      />
      <h1 className="mt-2 font-heading text-2xl font-semibold text-foreground">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The page you are looking for may have moved, or it no longer exists.
        Check the address, or start again from the homepage.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/" className={buttonStyles({ size: "lg" })}>
          Back to homepage
        </Link>
        <Link
          href="/professionals"
          className={buttonStyles({ variant: "outline", size: "lg" })}
        >
          Find a professional
        </Link>
      </div>
    </section>
  );
}
