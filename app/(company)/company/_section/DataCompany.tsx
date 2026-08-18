"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiArrowRight,
  FiEdit2,
  FiActivity,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { Mail, Globe, PhoneCall } from "lucide-react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { CompanyData } from "../type/type-company";
import { CompanySkeleton } from "../components/SkeletonCompany";

function ContactItem({
  icon: Icon,
  href,
  value,
  color,
  external = false,
}: {
  icon: React.ElementType;
  href?: string;
  value?: string | null;
  color: string;
  external?: boolean;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition hover:border-slate-200 hover:bg-white hover:shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
        <Icon className={color} size={16} />
      </div>
      {value ? (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="truncate text-sm font-medium text-slate-700 transition group-hover:text-indigo-600"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm text-slate-300">Not set</span>
      )}
    </div>
  );
}

const STAT_STYLES = {
  indigo: {
    iconBg: "bg-indigo-50",
    icon: "text-indigo-600",
    hoverBg: "group-hover:bg-indigo-600",
    bar: "bg-indigo-500",
  },
  amber: {
    iconBg: "bg-amber-50",
    icon: "text-amber-600",
    hoverBg: "group-hover:bg-amber-500",
    bar: "bg-amber-500",
  },
  violet: {
    iconBg: "bg-violet-50",
    icon: "text-violet-600",
    hoverBg: "group-hover:bg-violet-600",
    bar: "bg-violet-500",
  },
  slate: {
    iconBg: "bg-slate-100",
    icon: "text-slate-500",
    hoverBg: "group-hover:bg-slate-600",
    bar: "bg-slate-400",
  },
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  href: string;
  tone: keyof typeof STAT_STYLES;
}) {
  const s = STAT_STYLES[tone];
  return (
    <Link href={href}>
      <div className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-md">
        <span
          className={`absolute inset-y-0 left-0 w-1 ${s.bar} opacity-0 transition group-hover:opacity-100`}
        />
        <div className="flex items-center gap-3">
          <div
            className={`shrink-0 rounded-lg p-2.5 ${s.iconBg} ${s.hoverBg} transition`}
          >
            <Icon
              className={`${s.icon} group-hover:text-white transition`}
              size={20}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="text-2xl font-bold tabular-nums text-slate-800">
              {value}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DataCompanyOverView() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    ongoingEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
  });
  const isOwner = role === "OWNER";

  useEffect(() => {
    const fetchDataCompany = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/company");
        if (!res.ok) throw new Error();
        const json = await res.json();
        setCompany(json.data);
        setRole(json.role);
        setStats(json.stats);
      } catch {
        console.error("Gagal fetch company");
      } finally {
        setLoading(false);
      }
    };
    fetchDataCompany();
  }, []);

  if (loading) return <CompanySkeleton />;
  if (!company) return null;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-16 bg-linear-to-r from-indigo-500 via-indigo-500 to-violet-500" />

        <div className="-mt-10 px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="flex items-start gap-3 sm:gap-4">
            {company.logo ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-4 border-white bg-white shadow-md">
                <Image
                  src={company.logo}
                  alt={company.name}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-indigo-50 text-2xl font-bold text-indigo-600 shadow-md">
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1 pt-11">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold leading-snug text-slate-900">
                  {company.name}
                </h2>
                {company.isActive && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Active
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {isOwner && (
                  <Link
                    href={`/company/dashboard/edit/${company.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <FiEdit2 size={13} /> Edit
                  </Link>
                )}
                <Link
                  href={`/partners/${company.slug}`}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  View Page <FiArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {company.description && (
            <p className="mt-4 whitespace-pre-line border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-500">
              {company.description}
            </p>
          )}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Social Media & Contact
        </h3>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <ContactItem
            icon={Mail}
            href={`mailto:${company.email}`}
            value={company.email}
            color="text-indigo-500"
          />
          <ContactItem
            icon={FaInstagram}
            href={`https://instagram.com/${company.instagram ?? undefined}`}
            value={company.instagram}
            color="text-pink-500"
            external
          />
          <ContactItem
            icon={Globe}
            href={`https://www.${company.website ?? undefined}`}
            value={company.website}
            color="text-sky-500"
            external
          />
          <ContactItem
            icon={FaLinkedin}
            href={company.linkedln ?? undefined}
            value={company.linkedln}
            color="text-blue-700"
            external
          />
          <ContactItem
            icon={PhoneCall}
            href={`tel:${company.phone}`}
            value={company.phone}
            color="text-emerald-600"
          />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Events {company.name}
        </h3>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <StatCard
            icon={FiCalendar}
            label="Total Events"
            value={stats.totalEvents}
            href="/company/list-event"
            tone="indigo"
          />
          <StatCard
            icon={FiClock}
            label="Ongoing"
            value={stats.ongoingEvents}
            href="/company/list-event"
            tone="amber"
          />
          <StatCard
            icon={FiActivity}
            label="Upcoming"
            value={stats.upcomingEvents}
            href="/company/list-event"
            tone="violet"
          />
          <StatCard
            icon={FiCheckCircle}
            label="Past"
            value={stats.pastEvents}
            href="/company/list-event"
            tone="slate"
          />
        </div>
      </div>
    </div>
  );
}
