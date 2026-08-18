"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";

import { MenuItems } from "@/types/auth";

import { MdOutlineGridView, MdEvent, MdHome } from "react-icons/md";
import { FiBookOpen } from "react-icons/fi";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { FaUserPlus } from "react-icons/fa";

export default function SideBarCompany() {
  const pathname = usePathname();

  const [collapse, setCollapse] = useState(false);
  const [locked, setLocked] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const { data: session } = useSession();

  const companyRole = session?.user?.companyRole;
  const allowed = ["OWNER", "ADMIN"].includes(companyRole ?? "");

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() ?? "U";

  const isCollapse = collapse && !locked;

  const menu: MenuItems[] = [
    {
      name: "Overview",
      path: "/company/dashboard",
      icon: MdOutlineGridView,
    },

    ...(allowed
      ? [
          {
            name: "Create Events",
            path: "/company/create-event",
            icon: FiBookOpen,
          },
        ]
      : []),

    {
      name: "List Events",
      path: "/company/list-event",
      icon: MdEvent,
    },
    ...(allowed
      ? [
          {
            name: "Add User Company",
            path: "/company/add-user",
            icon: FaUserPlus,
          },
        ]
      : []),

    {
      name: "Go to Event",
      path: "/events",
      icon: MdHome,
    },
  ];

  return (
    <aside
      onMouseEnter={() => {
        if (!locked) setCollapse(false);
      }}
      onMouseLeave={() => {
        if (!locked) setCollapse(true);
      }}
      className={`hidden md:flex flex-col h-screen border-r border-gray-200 bg-white transition-all duration-300 ${
        isCollapse ? "w-20" : "w-64"
      }`}
    >
      {/* ================= Logo ================= */}
      <div className="relative flex h-24 items-center px-4 border-b border-gray-100">
        <Link
          href="/"
          className="flex items-center justify-center transition-transform duration-200 hover:scale-[1.02]"
        >
          {isCollapse ? (
            <Image
              src="/images/logo/logoSmall.webp"
              alt="Execorner"
              width={46}
              height={46}
              unoptimized
            />
          ) : (
            <Image
              src="/images/logo/logoNew.webp"
              alt="Execorner"
              width={170}
              height={70}
              unoptimized
            />
          )}
        </Link>

        {!isCollapse && (
          <button
            onClick={() => setLocked(!locked)}
            className="absolute right-4 rounded-lg p-2 hover:bg-gray-100 transition"
          >
            <Image
              src={
                locked
                  ? "/images/icon/side-panel-lock.svg"
                  : "/images/icon/side-panel.svg"
              }
              alt="Toggle"
              width={18}
              height={18}
            />
          </button>
        )}
      </div>

      {/* ================= Navigation ================= */}
      <div className="flex-1 overflow-hidden px-3 py-4">
        <nav className="space-y-2">
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
                className={`group flex items-center rounded-xl px-3 py-3 transition-all duration-200 ${
                  isCollapse ? "justify-center" : "gap-3"
                } ${
                  isActive
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Icon size={22} />

                {!isCollapse && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ================= User ================= */}
      <div className="relative border-t border-gray-200 p-3">
        <button
          onClick={() => setUserOpen((prev) => !prev)}
          className={`w-full rounded-xl  bg-white hover:bg-gray-50 transition ${
            isCollapse
              ? "flex justify-center p-2"
              : "flex items-center gap-3 px-3 py-3"
          }`}
        >
          <div className="relative h-10 w-10 shrink-0">
            {session?.user?.photo ? (
              <Image
                src={session.user.photo}
                alt={session.user.name ?? ""}
                fill
                unoptimized
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                {userInitial}
              </div>
            )}
          </div>

          {!isCollapse && (
            <>
              <div className="flex-1 overflow-hidden text-left">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {session?.user?.name}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {session?.user?.email}
                </p>
              </div>

              <FiChevronDown
                className={`transition duration-200 ${
                  userOpen ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </button>

        <AnimatePresence>
          {userOpen && !isCollapse && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
            >
              <Link
                href="/profile"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiUser size={17} />
                Edit Profile
              </Link>

              <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
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
