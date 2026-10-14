"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import {
  LayoutGrid,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { NotificationBell } from "@/app/components/notifications";
import { Menu } from "../data/menu";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import Container from "@/app/components/reusable/Container";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdmin = Boolean(session?.user?.adminRole);
  const pathname = usePathname();
  const userInitial = session?.user?.name?.charAt(0).toUpperCase() ?? "U";

  const isActive = (path: string) =>
    path === "/"
      ? pathname === "/"
      : pathname === path || pathname.startsWith(path + "/");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    const handleSize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleSize);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleSize);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full bg-card/95 backdrop-blur transition-shadow ${
          scrolled ? "border-b border-border shadow-search" : ""
        }`}
      >
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="MindCare.id, ke beranda"
            className="relative flex h-10 w-36 shrink-0 items-center md:w-44"
          >
            <Image
              src="/images/logo/logoNew.png"
              alt="MindCare.id"
              fill
              sizes="176px"
              priority
              className="object-contain object-left"
            />
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Navigasi utama"
          >
            {Menu.map((link) => (
              <Link
                key={link.link}
                href={link.link}
                aria-current={isActive(link.link) ? "page" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.link)
                    ? "bg-brand-lavender-100 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            {status === "authenticated" && <NotificationBell />}

            <div className="hidden items-center gap-3 lg:flex">
              {status === "authenticated" ? (
                <div
                  className="relative"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    onClick={() => setUserMenuOpen((open) => !open)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
                  >
                    <span className="relative size-8 shrink-0">
                      {session.user?.photo ? (
                        <Image
                          src={session.user.photo}
                          alt={session.user.name ?? "Pengguna"}
                          unoptimized
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          {userInitial}
                        </span>
                      )}
                    </span>
                    <span className="max-w-32 truncate text-sm font-medium text-foreground">
                      {session.user?.name}
                    </span>
                    <FiChevronDown
                      className={`size-4 text-muted-foreground transition-transform ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-card-hover"
                      >
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          <LayoutGrid className="size-4" /> Dashboard
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/cadmin"
                            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                          >
                            <ShieldCheck className="size-4" /> Admin Panel
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          <LogOut className="size-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/auth/login" className={buttonStyles({ size: "md" })}>
                  Join MindCare.id
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-label={isOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isOpen}
              className="rounded-md p-2 text-foreground transition-colors hover:bg-muted lg:hidden"
            >
              {isOpen ? <FiX className="size-5" /> : <FiMenu className="size-5" />}
            </button>
          </div>
        </Container>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-brand-navy-950/40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-x-0 top-16 z-50 border-b border-border bg-card shadow-card-hover lg:hidden"
            >
              <Container className="max-h-[calc(100vh-4rem)] overflow-y-auto py-4">
                <nav className="flex flex-col gap-1" aria-label="Navigasi seluler">
                  {Menu.map((link) => (
                    <Link
                      key={link.link}
                      href={link.link}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive(link.link) ? "page" : undefined}
                      className={`rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                        isActive(link.link)
                          ? "bg-brand-lavender-100 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.title}
                    </Link>
                  ))}
                </nav>

                <div className="mt-4 border-t border-border pt-4">
                  {status === "authenticated" ? (
                    <div className="flex flex-col gap-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <LayoutGrid className="size-4" /> Dashboard
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/cadmin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          <ShieldCheck className="size-4" /> Admin Panel
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-2 rounded-md px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <LogOut className="size-4" /> Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/auth/login"
                        onClick={() => setIsOpen(false)}
                        className={buttonStyles({ size: "lg", variant: "outline" })}
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setIsOpen(false)}
                        className={buttonStyles({ size: "lg" })}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </Container>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
