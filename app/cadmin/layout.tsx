import SideMenuAdmin from "@/app/components/SideMenuAdmin";
import "./dashboard.css";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Side Menu */}
      <SideMenuAdmin />
      <div className="flex-1">{children}</div>
    </div>
  );
}