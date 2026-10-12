"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  House,
  Users,
  Building2,
  CalendarDays,
  CircleUserRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import type { LucideIcon } from "lucide-react";

type NavLinkMobile = {
  name: string;
  path: string;
  icon: LucideIcon;
};

export default function NavbarMobile() {
  const { status } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  const isEventDetail =
    pathname.startsWith("/events/") && pathname !== "/events";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (status === "loading") return null;
  if (isEventDetail) return null;

  const accountLink: NavLinkMobile =
    status === "authenticated"
      ? { name: "Account", path: "/profile", icon: CircleUserRound }
      : { name: "Sign in", path: "/auth/login", icon: CircleUserRound };

  const navLinks: NavLinkMobile[] = [
    { name: "Home", path: "/", icon: House },
    { name: "Professionals", path: "/professionals", icon: Users },
    { name: "Centres", path: "/care-centres", icon: Building2 },
    { name: "Events", path: "/events", icon: CalendarDays },
    accountLink,
  ];

  return (
    <nav
      aria-label="Navigasi bawah"
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-safe backdrop-blur transition-shadow md:hidden ${
        scrolled ? "shadow-[0_-4px_16px_rgb(11_36_64/0.06)]" : ""
      }`}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {navLinks.map((item) => {
          const active =
            item.path === "/"
              ? pathname === "/"
              : pathname === item.path ||
                pathname.startsWith(item.path + "/");
          const Icon = item.icon;

          return (
            <li key={item.name} className="flex-1">
              <Link
                href={item.path}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="text-[11px] font-medium leading-none">
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
