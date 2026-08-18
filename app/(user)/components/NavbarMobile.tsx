"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MdConfirmationNumber, MdHome } from "react-icons/md";
import { CiLogin } from "react-icons/ci";
import { FaWallet } from "react-icons/fa";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import type { IconType } from "react-icons";
import { FaCircleUser } from "react-icons/fa6";

type NavLinkMobile = {
  name: string;
  path: string;
  icon: IconType;
};

export default function NavbarMobile() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [scroll, setScroll] = useState(false);

  const isEventDetail =
    pathname.startsWith("/events/") && pathname !== "/events";
  useEffect(() => {
    const handleScroll = () => setScroll(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLogin = status === "authenticated";
  const isLoading = status === "loading";

  if (isLoading) return null;
  if (isEventDetail) return null;

  const navLinks: NavLinkMobile[] = [
    { name: "Home", path: "/", icon: MdHome },
    { name: "Orders", path: "/dashboard/orders", icon: FaWallet },
    {
      name: "Ticket",
      path: "/dashboard/my-ticket",
      icon: MdConfirmationNumber,
    },
    isLogin
      ? { name: "Profile", path: "/profile", icon: FaCircleUser }
      : { name: "Login", path: "/auth/login", icon: CiLogin },
  ];

  return (
    <nav
      className={`
        fixed bottom-0 left-0 z-9999 w-full md:hidden
        bg-slate-950/95 backdrop-blur-xl border-t border-white/10
        pb-safe transition-shadow
        ${scroll ? "shadow-lg" : ""}
      `}
    >
      <ul className="flex w-full items-center justify-around py-2">
        {navLinks.map((item) => {
          const active = pathname === item.path;
          const Icon = item.icon;

          return (
            <li key={item.name} className="flex-1">
              <Link
                href={item.path}
                className="flex flex-col items-center gap-1 py-1"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`
                    flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all
                    ${active ? "bg-blue-500/15" : ""}
                  `}
                >
                  <Icon
                    size={22}
                    className={active ? "text-blue-400" : "text-slate-400"}
                  />
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      active ? "text-blue-400" : "text-slate-400"
                    }`}
                  >
                    {item.name}
                  </span>
                </motion.div>

                <div className="h-1">
                  {active && (
                    <motion.span
                      layoutId="active-indicator"
                      className="block h-1 w-4 rounded-full bg-blue-400"
                    />
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
