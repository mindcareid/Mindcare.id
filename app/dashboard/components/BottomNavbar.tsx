"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ReceiptText,
  CircleUserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMyListings } from "./listing/useMyListings";

type NavItem = { name: string; path: string; icon: LucideIcon };

export default function BottomNav() {
  const pathname = usePathname();
  const { canCreateEvents } = useMyListings();

  // Tab tetap di semua layar dashboard. Listing per-jenis (Professional,
  // Care centre, Solutions) dikelola lewat menu avatar di Topbar, bukan di sini,
  // karena satu akun bisa punya lebih dari satu listing. Events hanya relevan
  // kalau akun punya professional atau care centre (solution tidak bisa host event).
  const menu: NavItem[] = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    ...(canCreateEvents
      ? [{ name: "Events", path: "/dashboard/events", icon: CalendarDays }]
      : []),
    { name: "Orders", path: "/dashboard/orders", icon: ReceiptText },
    { name: "Account", path: "/profile", icon: CircleUserRound },
  ];

  return (
    <nav
      aria-label="Navigasi dashboard"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-safe backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {menu.map((item) => {
          const active =
            item.path === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.path ||
                pathname.startsWith(item.path + "/");
          const Icon = item.icon;

          return (
            <li key={item.path} className="flex-1">
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
