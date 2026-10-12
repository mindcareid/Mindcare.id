import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NavbarMobile from "./components/NavbarMobile";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <NavbarMobile />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
    </div>
  );
}
