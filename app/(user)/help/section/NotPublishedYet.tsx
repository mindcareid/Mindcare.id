import Link from "next/link";
import { FileClock } from "lucide-react";
import Container from "@/app/components/reusable/Container";
import PageHero from "@/app/components/reusable/PageHero";
import { VERIFICATION_POLICY_PATH } from "../../data/verification";

type NotPublishedYetProps = {
  title: string;
  summary: string;
  children?: React.ReactNode;
};

export default function NotPublishedYet({
  title,
  summary,
  children,
}: NotPublishedYetProps) {
  return (
    <div className="pb-20">
      <PageHero eyebrow="Legal & Safety" title={title} subtitle={summary} />

      <Container>
        <div className="max-w-3xl">
          <div className="flex gap-4 rounded-xl border border-border bg-brand-lavender-100 p-5">
            <FileClock
              size={22}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-primary"
            />
            <div>
              <p className="font-heading text-lg font-semibold text-foreground">
                Dokumen ini belum diterbitkan
              </p>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                Kami memilih membiarkan halaman ini kosong daripada memasang
                teks yang belum tentu berlaku. Begitu versi resminya siap,
                isinya akan muncul di alamat ini dan tanggal berlakunya
                dicantumkan.
              </p>
            </div>
          </div>

          {children && (
            <div className="mt-8 max-w-prose text-base leading-relaxed text-muted-foreground">
              {children}
            </div>
          )}

          <p className="mt-8 text-base leading-relaxed text-muted-foreground">
            Satu dokumen sudah bisa dibaca sekarang:{" "}
            <Link
              href={VERIFICATION_POLICY_PATH}
              className="font-medium text-secondary underline underline-offset-4 hover:text-brand-purple-700"
            >
              Verification Policy
            </Link>{" "}
            — apa arti badge Verified pada sebuah profil, dan apa yang sengaja
            tidak dijaminnya.
          </p>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            <Link
              href="/help"
              className="font-medium text-secondary underline underline-offset-4 hover:text-brand-purple-700"
            >
              Kembali ke Help Centre
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
