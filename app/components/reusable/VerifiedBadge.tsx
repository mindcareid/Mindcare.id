import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type VerifiedBadgeProps = {
  /**
   * WAJIB, dan sengaja tidak punya nilai bawaan.
   *
   * Sebelum 24 Agustus 2026 prop ini opsional dengan bawaan `"Verified"`, dan
   * keenam pemakaiannya memang tidak pernah mengopernya — jadi satu kata yang
   * sama muncul di atas nama orang DAN di atas nama gedung, padahal yang
   * diperiksa berbeda. Dengan dibuat wajib, call site yang lupa jadi error
   * `tsc`, bukan klaim yang terlalu besar yang lolos diam-diam.
   *
   * Ambil nilainya dari `verificationLabelOf()` di
   * `app/(user)/data/verification.ts` — jangan tulis teksnya langsung di sini.
   */
  label: string;
  /**
   * Bulan dan tahun pemeriksaan, mis. `"March 2026"`, dari `formatCheckedOn()`.
   *
   * Ini yang membuat badge-nya bisa dipertanggungjawabkan: tanpa tanggal, "sudah
   * diperiksa" terbaca sebagai keadaan permanen. Di kartu daftar sengaja
   * dikosongkan karena tempatnya sempit dan badge-nya menumpang di atas foto;
   * halaman detail yang menampilkannya.
   */
  checkedOn?: string | null;
  /**
   * Kalau ada, badge jadi tautan ke halaman kebijakan verifikasi
   * (`VERIFICATION_POLICY_PATH`).
   *
   * JANGAN diisi kalau badge-nya berada di dalam `EntityCard`: seluruh kartu itu
   * sudah dibungkus `<Link href>`, dan tautan di dalam tautan itu HTML yang tidak
   * sah — bukan sekadar tidak rapi. Di kartu badge-nya tetap teks biasa.
   */
  href?: string | null;
  className?: string;
};

const badgeClassName = cn(
  "inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2 py-1",
  "text-[13px] font-medium leading-none text-foreground",
);

export default function VerifiedBadge({
  label,
  checkedOn,
  href,
  className,
}: VerifiedBadgeProps) {
  const content = (
    <>
      <BadgeCheck className="size-3.5 text-accent" aria-hidden="true" />
      {label}
      {checkedOn && (
        <span className="font-normal text-muted-foreground">
          <span aria-hidden="true"> · </span>
          {checkedOn}
        </span>
      )}
    </>
  );

  if (!href) {
    return <span className={cn(badgeClassName, className)}>{content}</span>;
  }

  return (
    <Link
      href={href}
      // Teks badge-nya sendiri tidak menjelaskan bahwa ia bisa diklik dan ke mana
      // arahnya. Tanpa label ini, pembaca layar hanya mendengar "Licence checked,
      // link" — yang menyisakan tepat pertanyaan yang paling penting.
      aria-label={`${label}${checkedOn ? `, ${checkedOn}` : ""} — read how Mindcare checks listings`}
      className={cn(
        badgeClassName,
        "transition-colors hover:border-accent hover:text-accent",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      {content}
    </Link>
  );
}
