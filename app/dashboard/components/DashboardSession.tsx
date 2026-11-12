"use client";

import SessionBootstrap from "@/app/components/SessionBootstrap";
import type { Session } from "next-auth";

/**
 * Dashboard session (client boundary)
 * ============================================================
 *
 * PENTING: file ini WAJIB "use client".
 *
 * Modul ini memakai `SessionBootstrap` (yang memuat `Providers`),
 * dan Context tidak tersedia di Server Component. Tanpa directive ini,
 * Next menjalankan provider di server dan melempar:
 *
 *   "React Context is unavailable in Server Components"
 *
 * Pembacaan session dari cookie dilakukan di `dashboard/layout.tsx`
 * (server component) lalu dioper sebagai prop `session` ke sini.
 * Session itu diberikan ke satu-satunya `SessionProvider` yang ada
 * (di `app/providers.tsx`), sehingga session tetap tersedia pada render
 * pertama tanpa membayar fetch `/api/auth/session` di klien dan tanpa
 * membuat provider kedua yang bisa memberi `status` berbeda.
 */
export default function DashboardSessionProvider({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return <SessionBootstrap session={session}>{children}</SessionBootstrap>;
}
