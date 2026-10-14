import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import SideMenuAdmin from "@/app/components/SideMenuAdmin";
import { authOptions } from "@/lib/auth";
import { findAdminAccess } from "@/lib/adminGuard";
import "./dashboard.css";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/cadmin");
  }

  // Sumber otorisasi adalah tabel AdminAccess, dibaca di server setiap kali
  // halaman admin dibuka. Jadi mencabut akses admin langsung berlaku, tidak
  // menunggu token JWT kedaluwarsa.
  const access = await findAdminAccess(Number(session.user.id));
  if (!access) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Side Menu */}
      <SideMenuAdmin />
      <div className="min-w-0 flex-1 pt-14 lg:pt-0">{children}</div>
    </div>
  );
}
