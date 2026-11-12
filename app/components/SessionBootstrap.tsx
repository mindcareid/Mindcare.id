import type { Session } from "next-auth";
import Providers from "@/app/providers";

/**
 * Session bootstrap
 * ============================================================
 *
 * MASALAH YANG DIPERBAIKI
 *
 * Sebelumnya `getServerSession` dipanggil langsung di root layout
 * (`app/layout.tsx`). Fungsi itu membaca cookie, dan root layout
 * membungkus SEMUA route, sehingga seluruh aplikasi dipaksa
 * dynamic. Semua `revalidate` di halaman publik jadi tidak
 * berlaku: `/`, `/events`, `/events/[slug]`, `/professionals`,
 * `/care-centres` semuanya 0% cached dan dihitung sebagai
 * function invocation pada setiap page view.
 *
 * SOLUSI
 *
 * Komponen ini SENGAJA sinkron dan TIDAK membaca cookie. Root layout
 * memakainya tanpa prop `session`, sehingga halaman publik tetap
 * static/ISR. Halaman publik mengambil session sekali di klien lewat
 * `/api/auth/session`.
 *
 * Area yang sudah punya session dari server (dashboard) membaca
 * session di layout dinamikanya lalu meneruskannya lewat prop
 * `session` di bawah (lihat `app/dashboard/layout.tsx` dan
 * `app/dashboard/components/DashboardSession.tsx`). Dengan begitu
 * tetap hanya ada SATU `SessionProvider` (di `app/providers.tsx`).
 */
export default function SessionBootstrap({
  children,
  session,
}: {
  children: React.ReactNode;
  /** Session dari server, atau `undefined` untuk fetch sekali di klien. */
  session?: Session | null;
}) {
  return <Providers session={session}>{children}</Providers>;
}
