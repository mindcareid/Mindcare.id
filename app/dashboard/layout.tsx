import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BottomNav from "./components/BottomNavbar";
import Sidebar from "./components/SideBar";
import MobileTopbar from "./components/TopNavbar";
import DashboardSessionProvider from "./components/DashboardSession";

/**
 * Layout dashboard
 * ============================================================
 *
 * Root layout (`app/layout.tsx`) sengaja tidak lagi membaca cookie
 * agar halaman publik bisa static/ISR. Konsekuensinya session
 * untuk area terautentikasi disediakan di sini.
 *
 * Layout ini membaca session di server lalu mengopernya ke
 * `DashboardSessionProvider` (client component) lewat
 * `SessionBootstrap`, sehingga selalu hanya ada SATU
 * `SessionProvider` (di `app/providers.tsx`). Dengan begitu
 * Sidebar dan Topbar langsung menampilkan nama user pada render
 * pertama, tanpa kedipan inisial fallback "U" dan tanpa menunggu
 * `/api/auth/session`.
 *
 * Otorisasi tetap dilakukan per halaman (mis. `app/dashboard/page.tsx`
 * memanggil `getServerSession` dan `redirect`), jadi boundary ini
 * tidak menambah maupun mengurangi proteksi.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <DashboardSessionProvider session={session}>
      <div className="flex h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileTopbar />

          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>

        <BottomNav />
      </div>
    </DashboardSessionProvider>
  );
}
