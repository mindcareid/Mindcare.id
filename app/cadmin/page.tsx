import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCalendarDays,
  faEnvelope,
  faShieldHalved,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import prisma from "@/lib/prisma";
import { getAdminAccess } from "@/lib/adminGuard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [users, events, contacts, admins, access] = await Promise.all([
    prisma.user.count({ where: { isActive: true, deletedAt: null } }),
    prisma.event.count({ where: { deletedAt: null } }),
    prisma.contactMessage.count(),
    prisma.adminAccess.count({ where: { isActive: true } }),
    getAdminAccess(),
  ]);

  const stats = [
    {
      name: "Total Users",
      value: users,
      icon: faUsers,
      tint: "bg-brand-lavender-100 text-brand-purple-700",
      href: "/cadmin/user",
    },
    {
      name: "Total Events",
      value: events,
      icon: faCalendarDays,
      tint: "bg-brand-mint-100 text-brand-emerald-700",
      href: "/cadmin/events",
    },
    {
      name: "Email Contacts",
      value: contacts,
      icon: faEnvelope,
      tint: "bg-brand-lavender-200 text-brand-navy-800",
      href: "/cadmin/contactemail",
    },
    {
      name: "Admins",
      value: admins,
      icon: faShieldHalved,
      tint: "bg-brand-navy-800 text-white",
      href: "/cadmin/user",
    },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Welcome back{access?.name ? `, ${access.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of MindCare content and activity.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="group rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between">
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${stat.tint}`}
                >
                  <FontAwesomeIcon icon={stat.icon} className="size-5" />
                </span>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="size-3.5 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </div>
              <p className="mt-4 font-heading text-2xl font-semibold text-foreground">
                {stat.value.toLocaleString("id-ID")}
              </p>
              <p className="text-sm text-muted-foreground">{stat.name}</p>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Quick actions
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Manage users", href: "/cadmin/user" },
              { label: "Manage events", href: "/cadmin/events" },
              {
                label: "Directory applications",
                href: "/cadmin/applications",
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary hover:bg-muted"
              >
                {action.label}
                <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
