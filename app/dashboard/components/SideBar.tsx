"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdOutlineGridView, MdConfirmationNumber } from "react-icons/md";
//import { FiBookOpen } from "react-icons/fi";
import { FaRegCreditCard } from "react-icons/fa6";
//import { GrCertificate } from "react-icons/gr";
import { TbWorld } from "react-icons/tb";
import { MenuItems } from "@/types/auth";
import { useSession, signOut } from "next-auth/react";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

const menu: MenuItems[] = [
  { name: "Overview", path: "/dashboard", icon: MdOutlineGridView },
  // { name: "Schedules", path: "/dashboard/schedules", icon: BsCalendar2Date },
  { name: "Orders", path: "/dashboard/orders", icon: FaRegCreditCard },
  { name: "Ticket", path: "/dashboard/my-ticket", icon: MdConfirmationNumber },
  //{ name: "My Classes", path: "/dashboard/my-classes", icon: FiBookOpen },
  /* {
    name: "Certificate",
    path: "/dashboard/my-certificate",
    icon: GrCertificate,
  }, */
  {
    name: "Find All Events",
    path: "/events",
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

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <aside
      onMouseEnter={() => {
        if (!locked) setCollapsed(false);
      }}
      onMouseLeave={() => {
        if (!locked) setCollapsed(true);
      }}
      className={`h-screen top-0 transition-all duration-300
  border-r border-gray-200 bg-white 
   md:flex flex-col
  ${isCollapsed ? "w-20" : "w-64"}`}
    >
      <div className="relative flex items-center p-4">
        <div
          className={`flex items-center gap-x-2 h-24 w-full ${isCollapsed ? "mx-auto w-full" : ""
            }`}
        >
          <Link
            href="/"
            className="flex items-center justify-center transition-transform duration-200 hover:scale-[1.02]"
          >
            {isCollapsed ? (
              <div className="relative w-12 h-12">
                <Image
                  src="/images/logo/logoSmall.webp"
                  alt="Execorner"
                  fill
                  unoptimized
                  className=" object-contain"
                />
              </div>
            ) : (
              <div className="relative w-44 h-32">
                <Image
                  src="/images/logo/logo-execorner.png"
                  alt="Execorner"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            )}
          </Link>
        </div>

        {!isCollapsed && (
          <button
            onClick={() => setLocked(!locked)}
            className="absolute right-4"
          >
            <Image
              src={
                locked
                  ? "/images/icon/side-panel-lock.svg"
                  : "/images/icon/side-panel.svg"
              }
              alt="Toggle Sidebar Lock"
              width={22}
              height={22}
            />
          </button>
        )}
      </div>
      <nav className="mt-6 space-y-1 px-2 flex-1">
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
              className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"
                } px-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? "bg-blue-600 text-white"
                  : "text-neutral-900 hover:bg-white/10 hover:text-blue-500"
                }`}
            >
              <Icon size={24} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ================= User ================= */}
      <div className="relative border-t border-gray-200 p-3">
        <button
          onClick={() => setUserOpen((prev) => !prev)}
          className={`w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition ${isCollapsed
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

          {!isCollapsed && (
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
                className={`transition duration-200 ${userOpen ? "rotate-180" : ""
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
