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
      {/* Navbar transparan menimpa hero di semua halaman (fixed), jadi beri
          ruang setinggi navbar agar konten tidak tertutup. Home menimpa
          kembali padding ini agar hero-nya memanjang ke belakang navbar. */}
      <main className="flex-1 pt-16 pb-20 md:pb-0">{children}</main>
      <Footer />
    </div>
  );
}
