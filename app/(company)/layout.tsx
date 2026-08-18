import SideBarCompany from "./company/components/SideBarCompany";
import ButtomNavbar from "./company/components/ButtomNavbar";

export default function LayoutCompany({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <SideBarCompany />
        <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50">
          <div className="p-3 sm:p-4 md:p-6 pb-20 lg:pb-6">{children}</div>
        </main>
      </div>
      <ButtomNavbar />
    </div>
  );
}
