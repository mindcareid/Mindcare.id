import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Users2, Building2, ArrowLeft } from "lucide-react";
import Container from "@/app/components/reusable/Container";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

export const metadata: Metadata = {
  title: "Solutions - Segera Hadir",
  description:
    "Program dan solusi kesehatan mental Mindcare.id sedang dalam tahap pengembangan dan akan segera hadir.",
};

export default function SolutionsPage() {
  return (
    <div className="flex min-h-[75vh] items-center py-16">
      <Container className="max-w-3xl text-center">
        <div className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl border border-secondary/20 bg-brand-lavender-100 text-secondary">
          <Sparkles className="size-8" aria-hidden="true" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-secondary">
          Dalam Pengembangan
        </p>

        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Solutions Segera Hadir
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Kami sedang menyiapkan sarana self-care terstruktur, program
          pendampingan, serta modul kesehatan mental untuk individu, tempat
          kerja, dan komunitas.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/professionals"
            className={buttonStyles({
              size: "lg",
              className: "w-full sm:w-auto",
            })}
          >
            <Users2 className="size-4" aria-hidden="true" />
            Cari Profesional
          </Link>
          <Link
            href="/care-centres"
            className={buttonStyles({
              variant: "outline",
              size: "lg",
              className: "w-full sm:w-auto",
            })}
          >
            <Building2 className="size-4" aria-hidden="true" />
            Pusat Layanan
          </Link>
          <Link
            href="/"
            className={buttonStyles({
              variant: "ghost",
              size: "lg",
              className: "w-full sm:w-auto",
            })}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Kembali ke Beranda
          </Link>
        </div>
      </Container>
    </div>
  );
}
