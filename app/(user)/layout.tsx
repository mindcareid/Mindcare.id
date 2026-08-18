import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NavbarMobile from "./components/NavbarMobile";
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <NavbarMobile />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
