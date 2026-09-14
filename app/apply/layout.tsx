import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Apply",
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center px-6">
          <Link
            href="/"
            className="relative flex h-14 w-32 items-center md:w-44"
            aria-label="MindCare.id home"
          >
            <Image
              src="/images/logo/logoNew.png"
              alt="MindCare.id"
              fill
              priority
              className="object-contain"
            />
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
