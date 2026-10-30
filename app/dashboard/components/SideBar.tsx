"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdOutlineGridView,
  MdConfirmationNumber,
  MdWorkOutline,
  MdLocalHospital,
  MdOutlineEmojiObjects,
  MdCalendarMonth,
} from "react-icons/md";
import { useMyListings } from "./listing/useMyListings";
import { FaRegCreditCard } from "react-icons/fa6";
import { TbWorld } from "react-icons/tb";
import { MenuItems } from "@/types/auth";
import { useSession, signOut } from "next-auth/react";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

const menu: MenuItems[] = [
  { name: "Overview", path: "/dashboard", icon: MdOutlineGridView },
  { name: "Orders", path: "/dashboard/orders", icon: FaRegCreditCard },
  { name: "Ticket", path: "/dashboard/my-ticket", icon: MdConfirmationNumber },
  {
    name: "Homepage Website",
    path: "/",
    icon: TbWorld,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [locked, setLocked] = useState(false);

  const isCollapsed = collapsed && !locked;
  const { data: session } = useSession();
  const [userOpen, setUserOpen] = useState(false);
  const hasListing = useMyListings();

  const listingMenu: MenuItems[] = [
    ...(hasListing.professional
      ? [
          {
            name: "My Professional Listing",
            path: "/dashboard/professional",
            icon: MdWorkOutline,
          },
        ]
      : []),
    ...(hasListing.careCentre
      ? [
          {
            name: "My Care Centre",
            path: "/dashboard/care-centre",
            icon: MdLocalHospital,
          },
        ]
      : []),
    ...(hasListing.solution
      ? [
          {
            name: "My Solutions",
            path: "/dashboard/solution",
            icon: MdOutlineEmojiObjects,
          },
        ]
      : []),
    // ...(hasListing.canCreateEvents
    //   ? [
    //       {
    //         name: "My Events",
    //         path: "/dashboard/events",
    //         icon: MdCalendarMonth,
    //       },
    //     ]
    //   : []),
  ];

  const navigationMenu: MenuItems[] = [...menu, ...listingMenu];

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <aside
      onMouseEnter={() => {
        if (!locked) setCollapsed(false);
      }}
      onMouseLeave={() => {
        if (!locked) setCollapsed(true);
      }}
      className={`h-screen top-0 border-r border-border bg-card transition-all duration-300
  md:flex flex-col
  ${isCollapsed ? "w-20" : "w-64"}`}
    >
      <div className="relative flex items-center p-4">
        <div
          className={`flex items-center gap-x-2 h-20 w-full ${
            isCollapsed ? "mx-auto w-full" : ""
          }`}
        >
          <Link
            href="/"
            aria-label="MindCare.id, ke beranda"
            className="flex items-center justify-center transition-transform duration-200 hover:scale-[1.02]"
          >
            {isCollapsed ? (
              <div className="relative w-11 h-11">
                <Image
                  src="/images/logo/iconMindcare.png"
                  alt="MindCare.id"
                  fill
                  unoptimized
                  sizes="44px"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="relative w-44 h-12">
                <Image
                  src="/images/logo/mindcare-logo.png"
                  alt="MindCare.id"
                  fill
                  sizes="176px"
                  className="object-contain object-left"
                />
              </div>
            )}
          </Link>
        </div>

        {!isCollapsed && (
          <button
            onClick={() => setLocked(!locked)}
            aria-label={locked ? "Buka kunci sidebar" : "Kunci sidebar"}
            className="absolute right-4"
          >
            <Image
              src={
                locked
                  ? "/images/icon/side-panel-lock.svg"
                  : "/images/icon/side-panel.svg"
              }
              alt=""
              width={22}
              height={22}
            />
          </button>
        )}
      </div>

      <nav className="mt-4 space-y-1 px-3 flex-1">
        {navigationMenu.map((item) => {
          const isActive =
            item.path === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.path || pathname.startsWith(item.path + "/");

          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={isActive ? "page" : undefined}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "gap-3"
              } px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-lavender-100 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={22} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ================= User ================= */}
      <div className="relative border-t border-border p-3">
        <button
          onClick={() => setUserOpen((prev) => !prev)}
          className={`w-full rounded-lg border border-border bg-card transition-colors hover:bg-muted ${
            isCollapsed
              ? "flex justify-center p-2"
              : "flex items-center gap-3 px-3 py-2.5"
          }`}
        >
          <div className="relative h-9 w-9 shrink-0">
            {session?.user?.photo ? (
              <Image
                src={session.user.photo}
                alt={session.user.name ?? ""}
                fill
                unoptimized
                sizes="36px"
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {userInitial}
              </div>
            )}
          </div>

          {!isCollapsed && (
            <>
              <div className="flex-1 overflow-hidden text-left">
                <p className="truncate text-sm font-semibold text-foreground">
                  {session?.user?.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>

              <FiChevronDown
                className={`text-muted-foreground transition-transform duration-200 ${
                  userOpen ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </button>

        <AnimatePresence>
          {userOpen && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-border bg-card shadow-card-hover"
            >
              <Link
                href="/profile"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <FiUser size={17} />
                Edit Profile
              </Link>

              <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <FiLogOut size={17} />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
