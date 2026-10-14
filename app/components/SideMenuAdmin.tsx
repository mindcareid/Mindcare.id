"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faBars,
  faXmark,
  faGauge,
  faCalendarDays,
  faEnvelope,
  faClipboardCheck,
  faUsers,
  faChevronDown,
  faArrowUpRightFromSquare,
  faRightFromBracket,
  faShieldHalved,
  faTags,
  faBriefcase,
  faLayerGroup,
  faUserGroup,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

const EVENT_LINKS = [
  { href: "/cadmin/events", label: "Event List" },
  { href: "/cadmin/event-categories", label: "Event Categories" },
  { href: "/cadmin/event-industries", label: "Event Industries" },
  { href: "/cadmin/event-focus-areas", label: "Event Focus Areas" },
] as const;

const NAV_LINKS: {
  href: string;
  label: string;
  icon: IconProp;
  section: string;
  superadminOnly?: boolean;
}[] = [
  { href: "/cadmin", label: "Dashboard", icon: faGauge, section: "Overview" },
  {
    href: "/cadmin/contactemail",
    label: "Email Contact",
    icon: faEnvelope,
    section: "Messages",
  },
  {
    href: "/cadmin/applications",
    label: "Directory Applications",
    icon: faClipboardCheck,
    section: "Applications",
  },
  {
    href: "/cadmin/user",
    label: "Users",
    icon: faUsers,
    section: "Access",
  },
  {
    href: "/cadmin/areas-of-support",
    label: "Areas of Support",
    icon: faTags,
    section: "Reference",
  },
  {
    href: "/cadmin/centre-services",
    label: "Centre Services",
    icon: faBriefcase,
    section: "Reference",
  },
  {
    href: "/cadmin/solution-categories",
    label: "Solution Categories",
    icon: faLayerGroup,
    section: "Reference",
  },
  {
    href: "/cadmin/solution-audiences",
    label: "Solution Audiences",
    icon: faUserGroup,
    section: "Reference",
  },
  // {
  //   href: "/cadmin/audit-logs",
  //   label: "Audit Logs",
  //   icon: faClockRotateLeft,
  //   section: "Security",
  //   superadminOnly: true,
  // },
];

export default function SideMenuAdmin() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [eventToggle, setEventToggle] = useState<boolean | null>(null);

  const isSuperadmin = session?.user?.adminRole === "SUPERADMIN";
  const navLinks = NAV_LINKS.filter(
    (item) => !item.superadminOnly || isSuperadmin,
  );

  const isActive = (href: string) =>
    href === "/cadmin"
      ? pathname === "/cadmin"
      : pathname === href || pathname.startsWith(`${href}/`);

  const eventsActive = EVENT_LINKS.some((link) => isActive(link.href));
  const eventOpen = eventToggle ?? eventsActive;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sections = Array.from(new Set(navLinks.map((item) => item.section)));

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-white/10 bg-brand-navy-950 px-4 text-white">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={open}
          className="flex size-9 items-center justify-center rounded-lg transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-600"
        >
          <FontAwesomeIcon icon={faBars} className="size-5" />
        </button>
        <span className="font-heading text-sm font-semibold tracking-wide">
          MindCare <span className="text-brand-lavender-200/70">Admin</span>
        </span>
      </header>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-brand-navy-950/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Sidebar */}
      <aside
        aria-label="Admin navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-brand-navy-950 text-brand-lavender-100 transition-transform duration-300 ease-out",
          "lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple-600 text-white shadow-lg">
            <FontAwesomeIcon icon={faShieldHalved} className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-base font-semibold leading-tight text-white">
              MindCare
            </p>
            <p className="text-xs text-brand-lavender-200/70">Admin Panel</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close admin menu"
            className="flex size-8 items-center justify-center rounded-lg transition hover:bg-white/10 lg:hidden"
          >
            <FontAwesomeIcon icon={faXmark} className="size-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4 scrollbar-thin [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-track]:bg-transparent">
          {sections.map((section) => (
            <div key={section} className="space-y-1">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-lavender-200/50">
                {section}
              </p>

              {navLinks
                .filter((item) => item.section === section)
                .map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={isActive(item.href)}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
            </div>
          ))}

          {/* Events group */}
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-lavender-200/50">
              Events
            </p>
            <button
              type="button"
              onClick={() => setEventToggle(!eventOpen)}
              aria-expanded={eventOpen}
              className={cn(
                "group relative flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                eventsActive
                  ? "bg-white/10 text-white"
                  : "text-brand-lavender-100/80 hover:bg-white/10 hover:text-white",
              )}
            >
              {eventsActive && <ActiveBar />}
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="size-4 shrink-0"
              />
              <span className="min-w-0 flex-1 truncate text-left font-medium">
                Manage Events
              </span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={cn(
                  "size-3 transition-transform duration-200",
                  eventOpen && "rotate-180",
                )}
              />
            </button>

            <div
              className={cn(
                "grid transition-all duration-200",
                eventOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <ul className="ml-4 overflow-hidden border-l border-white/10">
                {EVENT_LINKS.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative flex items-center gap-3 rounded-lg py-2 pl-4 pr-3 text-sm transition",
                          active
                            ? "text-white"
                            : "text-brand-lavender-100/70 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full transition",
                            active
                              ? "bg-brand-emerald-600"
                              : "bg-brand-lavender-200/40",
                          )}
                        />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="space-y-1 border-t border-white/10 px-3 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-brand-lavender-100/80 transition hover:bg-white/10 hover:text-white"
          >
            <FontAwesomeIcon
              icon={faArrowUpRightFromSquare}
              className="size-4 shrink-0"
            />
            View website
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-destructive transition hover:bg-white/10"
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="size-4 shrink-0"
            />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: IconProp;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-white/10 text-white"
          : "text-brand-lavender-100/80 hover:bg-white/10 hover:text-white",
      )}
    >
      {active && <ActiveBar />}
      <FontAwesomeIcon icon={icon} className="size-4 shrink-0" />
      <span
        className={cn(
          "min-w-0 truncate font-medium",
          active && "font-semibold",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

function ActiveBar() {
  return (
    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-emerald-600" />
  );
}
