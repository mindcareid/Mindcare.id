"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faHome,
  faDotCircle,
  faBriefcase,
  faUsers,
  faBars,
  faCircleInfo,
  faTimes,
  faImage,
  faLightbulb,
  faBuilding,
  faCalendar,
  faNewspaper,
  faChevronDown,
  faArrowUpRightFromSquare,
  faRightFromBracket,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";
import { signOut } from "next-auth/react";

export default function SideMenuAdmin() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [eventOpen, setEventOpen] = useState(true);

  const isActive = (href: string) => {
    if (href === "/cadmin") return pathname === "/cadmin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow"
        onClick={() => setIsOpen(true)}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed md:static top-0 left-0 z-50 bg-white border-r min-h-screen p-6 w-64 transition-transform duration-300 shadow",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-blue-600">Admin Panel</h3>
          <button
            className="md:hidden text-gray-500"
            onClick={() => setIsOpen(false)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <ul className="space-y-1">
          {/* Dashboard */}
          <MenuItem
            href="/cadmin"
            icon={faHome}
            label="Dashboard"
            active={isActive("/cadmin")}
          />

          <MenuItem
            href="/"
            icon={faArrowUpRightFromSquare}
            label="Go to Website"
            active={false}
          />

          {/* Articles */}
          <MenuItem
            href="/cadmin/articles"
            icon={faNewspaper}
            label="Articles"
            active={isActive("/cadmin/articles")}
          />

          <MenuItem
            href="/cadmin/categories"
            icon={faBriefcase}
            label="Categories"
            active={isActive("/cadmin/categories")}
          />

          <MenuItem
            href="/cadmin/user"
            icon={faUsers}
            label="Users"
            active={isActive("/cadmin/user")}
          />

          <MenuItem
            href="/cadmin/companies"
            icon={faBuilding}
            label="Companies"
            active={isActive("/cadmin/companies")}
          />

          {/* ===== EVENT GROUP ===== */}
          <li className="mt-3">
            <button
              type="button"
              onClick={() => setEventOpen((p) => !p)}
              className={clsx(
                "flex w-full items-center justify-between px-4 py-2 rounded-lg transition",
                isActive("/cadmin/events") ||
                  isActive("/cadmin/event-categories")
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600",
              )}
            >
              <span className="flex items-center gap-3">
                <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                <span className="text-sm">Events</span>
              </span>

              <FontAwesomeIcon
                icon={faChevronDown}
                className={clsx(
                  "transition-transform text-xs",
                  eventOpen && "rotate-180",
                )}
              />
            </button>

            {eventOpen && (
              <ul className="ml-6 mt-1 space-y-1">
                <MenuItem
                  href="/cadmin/events"
                  icon={faDotCircle}
                  label="Event List"
                  active={isActive("/cadmin/events")}
                  compact
                />
                <MenuItem
                  href="/cadmin/event-categories"
                  icon={faDotCircle}
                  label="Event Categories"
                  active={isActive("/cadmin/event-categories")}
                  compact
                />
                <MenuItem
                  href="/cadmin/event-industries"
                  icon={faDotCircle}
                  label="Event Industries"
                  active={isActive("/cadmin/event-industries")}
                  compact
                />
              </ul>
            )}
          </li>

          {/* Content Sections */}
          <MenuItem
            href="/cadmin/hero"
            icon={faImage}
            label="Hero Slider"
            active={isActive("/cadmin/hero")}
          />

          <MenuItem
            href="/cadmin/whyus"
            icon={faLightbulb}
            label="Why Us"
            active={isActive("/cadmin/whyus")}
          />

          <MenuItem
            href="/cadmin/aboutsection"
            icon={faCircleInfo}
            label="About Section"
            active={isActive("/cadmin/aboutsection")}
          />
          <MenuItem
            href="/cadmin/contactemail"
            icon={faEnvelope}
            label="Email Contact"
            active={isActive("/cadmin/contactemail")}
          />
          <MenuItem
            href="/cadmin/company-accept"
            icon={faBuilding}
            label="Company Accept"
            active={isActive("/cadmin/company-accept")}
          />
        </ul>
        <li className="pt-4 mt-4 border-t">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </li>
      </aside>
    </>
  );
}

/* =========================
   REUSABLE COMPONENTS
========================= */

type MenuItemProps = {
  href: string;
  icon: IconProp;
  label: string;
  active: boolean;
  compact?: boolean;
};

function MenuItem({ href, icon, label, active, compact }: MenuItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={clsx(
          "flex items-center gap-3 rounded-lg transition",
          compact ? "px-3 py-2 text-sm" : "px-4 py-2",
          active
            ? "bg-blue-100 text-blue-700 font-semibold"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600",
        )}
      >
        <FontAwesomeIcon icon={icon} className="w-4 h-4" />
        <span>{label}</span>
      </Link>
    </li>
  );
}
