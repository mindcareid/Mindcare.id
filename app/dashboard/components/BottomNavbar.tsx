"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdOutlineGridView,
  MdConfirmationNumber,
  MdWorkOutline,
} from "react-icons/md";
import { FaRegCreditCard } from "react-icons/fa6";
import { FiUser } from "react-icons/fi";
import { useMyListings } from "./listing/useMyListings";
const baseMenu = [
  { name: "Overview", path: "/dashboard", icon: MdOutlineGridView },
  { name: "Orders", path: "/dashboard/orders", icon: FaRegCreditCard },
  { name: "Ticket", path: "/dashboard/my-ticket", icon: MdConfirmationNumber },
  { name: "Profile", path: "/profile", icon: FiUser },
];

export default function BottomNav() {
  const pathname = usePathname();
  const hasListing = useMyListings();
  const onListingPage =
    pathname.startsWith("/dashboard/professional") ||
    pathname.startsWith("/dashboard/care-centre");

  const menu =
    onListingPage && (hasListing.professional || hasListing.careCentre)
      ? [
          { name: "Overview", path: "/dashboard", icon: MdOutlineGridView },
          {
            name: hasListing.professional ? "My Listing" : "My Centre",
            path: hasListing.professional
              ? "/dashboard/professional"
              : "/dashboard/care-centre",
            icon: MdWorkOutline,
          },
          { name: "Orders", path: "/dashboard/orders", icon: FaRegCreditCard },
          { name: "Profile", path: "/profile", icon: FiUser },
        ]
      : baseMenu;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden
                    bg-slate-950/95 backdrop-blur-xl
                    border-t border-white/10
                    flex pb-safe"
    >
      {menu.map((item) => {
        const isActive =
          item.path === "/dashboard"
            ? pathname === "/dashboard"
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
                className={isActive ? "text-blue-400" : "text-white/40"}
              />
            </div>

            <span
              className={`text-[10px] font-medium ${
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
