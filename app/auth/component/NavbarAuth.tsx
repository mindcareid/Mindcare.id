import Image from "next/image";
import Link from "next/link";

export default function NavbarAuth() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="relative flex items-center h-16 w-32 md:w-64"
          >
            <Image
              src="/images/logo/logo-execorner.png"
              alt="Execorner"
              fill
              priority
              className="object-contain"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}
