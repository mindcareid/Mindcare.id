import BottomNav from "./components/BottomNavbar";
import Sidebar from "./components/SideBar";
import MobileTopbar from "./components/TopNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileTopbar />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
