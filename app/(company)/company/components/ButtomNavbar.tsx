"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  UserRoundPlus,
  SquarePen,
  BookOpen,
  LayoutPanelTop,
  CalendarPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSession } from "next-auth/react";

type Items = {
  name: string;
  path: string;
  icon: LucideIcon;
};

export default function ButtomNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const companyRole = session?.user?.companyRole;
  const Allow = ["OWNER", "ADMIN"].includes(companyRole ?? "");

  const menu: Items[] = [
    {
      name: "Overview",
      path: "/company/dashboard",
      icon: LayoutPanelTop,
    },
    ...(Allow
      ? [
          {
            name: "Create Events",
            path: "/company/create-event",
            icon: BookOpen,
          },
        ]
      : []),
    {
      name: "List Events",
      path: "/company/list-event",
      icon: SquarePen,
    },
    ...(Allow
      ? [
          {
            name: "User Company",
            path: "/company/add-user",
            icon: UserRoundPlus,
          },
        ]
      : []),
  ];

  return (
    <nav className=" fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/95 border-t border-white/10 flex">
      {menu.map((item) => {
        const isActive =
          item.path === "/company/dashboard"
            ? pathname === "/company/dashboard"
            : pathname.startsWith(item.path);

        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            href={item.path}
            className="flex-1 flex flex-col items-center gap-1 py-2 transition-all"
          >
            <div
              className={`px-3 py-1 rounded-xl transition-all ${
                isActive ? "bg-blue-500/15" : ""
              }`}
            >
              <Icon
                size={22}
                className={isActive ? "text-blue-600" : "text-white/40"}
              />
            </div>

            <span
              className={`text-sm font-semibold ${
                isActive ? "text-blue-400" : "text-white/40"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
