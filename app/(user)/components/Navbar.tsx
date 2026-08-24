"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMenu, FiX, FiChevronDown, FiChevronRight } from "react-icons/fi";
import Button from "@/app/components/reusable/Button";
import {
  UserRound,
  LayoutGrid,
  Building2,
  ShieldCheck,
  LogOut,
  UserPlus,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { NotificationBell } from "@/app/components/notifications";
import { Menu } from "../data/menu";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [subDropdownOpen, setSubDropdownOpen] = useState<string | null>(null);
  const [company, setCompany] = useState(false);

  const role = session?.user?.role;
  const isAdmin = role === "ADMIN" || role === "SUPERADMIN";

  const pathname = usePathname();
  const userInitial = session?.user?.name?.charAt(0).toUpperCase() ?? "U";
  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const hasCompany = company;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleSize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleSize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleSize);
    };
  }, []);

  // const programNav: NavLink = {
  //   name: "Programs",
  //   path: "/programs",
  //   dropdown: categories.map((cat) => ({
  //     name: cat.name,
  //     path: `/programs/${cat.slug}`,
  //     subCategories: cat.subCategories.map((sub) => ({
  //       name: sub.name,
  //       path: `/programs/${cat.slug}/${sub.slug}`,
  //     })),
  //   })),
  // };

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/company")
        .then((r) => r.json())
        .then((json) => {
          if (json.data) setCompany(true);
          else setCompany(false);
        })
        .catch(() => setCompany(false));
    }
  }, [status]);

  return (
    <nav
      className={`sticky top-0 left-0 w-full z-500 transition-all duration-300 bg-white border-b border-gray-200 ${
        scrolled ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <div className="mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/" className="relative flex items-center h-16 w-40 md:w-60">
          <Image
            src="/images/logo/logoNew.png"
            alt="Execorner"
            fill
            priority
            className="object-contain"
          />
        </Link>
        <div className="hidden lg:flex items-center gap-2">
          {Menu.map((link) => (
            <div
              key={link.link}
              className="relative"
              // onMouseEnter={() => link.dropdown && setDropdownOpen(link.title)}
            >
              <Link
                href={link.link}
                className={`flex items-center gap-1 px-2 py-2 transition-all ${
                  isActive(link.link)
                    ? " border-b-4 border-secondary text-secondary font-semibold"
                    : " text-neutral-700 hover:bg-white/5 hover:text-neutral-950 font-semibold"
                }`}
              >
                {link.title}
                {/* {link.dropdown && (
                  <FiChevronDown
                    className={`transition-transform ${
                      dropdownOpen === link.name ? "rotate-180" : ""
                    }`}
                  />
                )} */}
              </Link>
              {/* {link.dropdown && dropdownOpen === link.name && (
                <div
                  className="absolute top-full left-0 pt-2"
                  onMouseLeave={() => {
                    setDropdownOpen(null);
                    setSubDropdownOpen(null);
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-56 bg-slate-900/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl"
                  >
                    {link.dropdown.map((item) => (
                      <div
                        key={item.path}
                        className="relative"
                        onMouseEnter={() =>
                          item.subCategories && setSubDropdownOpen(item.name)
                        }
                      >
                        {item.subCategories ? (
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <span>{item.name}</span>
                            <FiChevronRight className="text-gray-500" />
                          </button>
                        ) : (
                          <Link
                            href={item.path}
                            className="block px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            {item.name}
                          </Link>
                        )}
                        {item.subCategories &&
                          subDropdownOpen === item.name && (
                            <div className="absolute left-full top-0 pl-2">
                              <div className="absolute left-0 top-0 bottom-0 w-2 bg-transparent" />
                              <motion.div
                                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="w-64 bg-linear-to-b from-slate-900/98 to-slate-800/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                              >
                                <div className="px-4 py-2.5 bg-linear-to-r from-blue-600/20 to-cyan-600/10 border-b border-white/10">
                                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                                    {item.name}
                                  </span>
                                </div>
                                <div className="py-2">
                                  {item.subCategories.map((sub, idx) => (
                                    <motion.div
                                      key={sub.path}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{
                                        duration: 0.2,
                                        delay: idx * 0.05,
                                      }}
                                    >
                                      <Link
                                        href={sub.path}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-linear-to-r hover:from-blue-600/20 hover:to-transparent hover:text-white transition-all group"
                                      >
                                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500/50 group-hover:bg-blue-400 group-hover:scale-150 transition-all duration-200" />
                                        <span className="text-sm font-medium">
                                          {sub.name}
                                        </span>
                                      </Link>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            </div>
                          )}
                      </div>
                    ))}
                  </motion.div>
                </div>
              )} */}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {status === "authenticated" && <NotificationBell />}
          <div className="hidden lg:flex items-center gap-3">
            {status === "authenticated" ? (
              <div
                className="relative"
                onMouseEnter={() => setDropdownOpen("user")}
                onMouseLeave={() => setDropdownOpen(null)}
              >
                <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition rounded-lg">
                  <div className="relative w-8 h-8 shrink-0">
                    {session.user?.photo ? (
                      <Image
                        src={session.user.photo}
                        alt={session.user.name ?? "User"}
                        unoptimized
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {userInitial}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-neutral-900">
                    {session.user?.name}
                  </span>
                  <FiChevronDown className="text-neutral-900" />
                </button>
                <AnimatePresence>
                  {dropdownOpen === "user" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-56 bg-white backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center gap-2  px-4 py-3 text-neutral-900 font-semibold hover:text-blue-500 transition"
                      >
                        <UserRound /> Edit Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2  px-4 py-3 text-neutral-900 font-semibold hover:text-blue-500 transition"
                      >
                        <LayoutGrid /> Dashboard
                      </Link>
                      {!hasCompany ? (
                        <Link
                          href="/company/create"
                          className="flex items-center gap-2  px-4 py-3 text-neutral-900 font-semibold hover:text-blue-500 transition"
                        >
                          <Building2 /> Create Company
                        </Link>
                      ) : (
                        <Link
                          href={`/company/dashboard`}
                          className="flex items-center gap-2  px-4 py-3 text-neutral-900 font-semibold hover:text-blue-500 transition"
                        >
                          <Building2 /> My Company
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          href="/cadmin"
                          className="flex items-center gap-2  px-4 py-3 text-neutral-900 font-semibold hover:text-blue-500 transition"
                        >
                          <ShieldCheck /> Admin Panel{" "}
                        </Link>
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2  px-4 py-3 text-neutral-900 font-semibold hover:text-red-500 transition"
                      >
                        <LogOut /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mx-4">
                <Link
                  href="/auth/login"
                  className={buttonStyles({ size: "lg" })}
                >
                  Join Mindcare.Id
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-neutral-900 text-2xl p-1"
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50  lg:hidden z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-full left-0 w-full bg-white  border-b border-white/10 shadow-2xl lg:hidden z-50 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-neutral-950 font-semibold">Menu</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-neutral-900 text-2xl font-semibold hover:text-neutral-950 transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <FiX />
                  </button>
                </div>
                <div className="space-y-2">
                  {Menu.map((link, idx) => (
                    <div key={link.link}>
                      {link.dropdown ? (
                        <div>
                          <button
                            onClick={() =>
                              setDropdownOpen(
                                dropdownOpen === link.title ? null : link.title,
                              )
                            }
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all font-medium ${
                              pathname.startsWith(link.link)
                                ? "bg-blue-600 text-white"
                                : "text-neutral-900 hover:text-neutral-900"
                            }`}
                          >
                            <span>{link.title}</span>
                            <FiChevronDown
                              className={`transition-transform ${
                                dropdownOpen === link.title ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {dropdownOpen === link.title && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden ml-4 mt-2 space-y-1"
                              >
                                {link.dropdown.map((item) => (
                                  <div key={item.path}>
                                    {item.subCategories ? (
                                      <div>
                                        <button
                                          onClick={() =>
                                            setSubDropdownOpen(
                                              subDropdownOpen === item.name
                                                ? null
                                                : item.name,
                                            )
                                          }
                                          className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-neutral-900  hover:text-white transition-colors text-sm"
                                        >
                                          <span>{item.name}</span>
                                          <FiChevronRight
                                            className={`transition-transform ${
                                              subDropdownOpen === item.name
                                                ? "rotate-90"
                                                : ""
                                            }`}
                                          />
                                        </button>
                                        <AnimatePresence>
                                          {subDropdownOpen === item.name && (
                                            <motion.div
                                              initial={{
                                                height: 0,
                                                opacity: 0,
                                              }}
                                              animate={{
                                                height: "auto",
                                                opacity: 1,
                                              }}
                                              exit={{ height: 0, opacity: 0 }}
                                              className="ml-4 mt-1 space-y-1 overflow-hidden"
                                            >
                                              {item.subCategories.map((sub) => (
                                                <Link
                                                  key={sub.path}
                                                  href={sub.path}
                                                  onClick={() =>
                                                    setIsOpen(false)
                                                  }
                                                  className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors text-sm"
                                                >
                                                  {sub.name}
                                                </Link>
                                              ))}
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    ) : (
                                      <Link
                                        href={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm"
                                      >
                                        {item.name}
                                      </Link>
                                    )}
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Link
                            href={link.link}
                            onClick={() => setIsOpen(false)}
                            className={`block px-4 py-3 rounded-lg transition-all font-medium ${
                              pathname === link.link
                                ? "bg-secondary text-white"
                                : "text-neutral-900 hover:bg-white/10 hover:text-blue-500"
                            }`}
                          >
                            {link.title}
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
                {status === "authenticated" ? (
                  <div className="w-full pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-neutral-950 font-semibold">
                        Profile
                      </h3>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-neutral-900 font-semibold hover:text-blue-500 transition rounded-lg"
                    >
                      <UserRound /> Edit Profile
                    </Link>
                    {company ? (
                      <Link
                        href="/company/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-neutral-900 font-semibold hover:text-blue-500 transition rounded-lg"
                      >
                        <Building2 /> Company
                      </Link>
                    ) : (
                      <Link
                        href="/company/create"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-neutral-900 font-semibold hover:text-blue-500 transition rounded-lg"
                      >
                        <Building2 /> Create Company
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-2 text-left px-4 py-3 text-neutral-950 hover:text-red-500 font-semibold rounded-lg "
                    >
                      <LogOut /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pt-4 border-t border-white/10 mt-4">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className={buttonStyles({
                        size: "lg",
                        variant: "outline",
                      })}
                    >
                      <UserRound /> Login
                      {/* <Button icon={UserRound} iconPosition="left">
                        Register
                      </Button> */}
                    </Link>

                    <Link
                      href="/auth/register"
                      onClick={() => setIsOpen(false)}
                      className={buttonStyles({ size: "lg" })}
                    >
                      <UserPlus /> Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
