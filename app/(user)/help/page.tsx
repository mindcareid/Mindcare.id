// app/company/help/page.tsx

import Link from "next/link";
import { HelpSearch } from "./components/HelpSearch";
import {
  MdOutlineBuildCircle,
  MdOutlineShield,
  MdOutlineCampaign,
  MdOutlineCreditCard,
  MdOutlineLocalShipping,
} from "react-icons/md";
import { ComponentType } from "react";
import Image from "next/image";

type HelpTopic = {
  name: string;
  slug: string;
  icon: ComponentType<{ size?: number }>;
  color: "green" | "blue" | "amber" | "red" | "purple" | "teal";
};

const topics: HelpTopic[] = [
  {
    name: "Privacy Policy",
    slug: "privacy-policy",
    icon: MdOutlineBuildCircle,
    color: "green",
  },
  {
    name: "Terms Of Service",
    slug: "terms-of-service",
    icon: MdOutlineShield,
    color: "blue",
  },
];

// Map warna ke class Tailwind — dipisah agar tidak ada purge CSS issue
const colorMap: Record<HelpTopic["color"], string> = {
  green: "bg-emerald-50  text-emerald-700",
  blue: "bg-blue-50     text-blue-700",
  amber: "bg-amber-50    text-amber-700",
  red: "bg-red-50      text-red-700",
  purple: "bg-purple-50   text-purple-700",
  teal: "bg-teal-50     text-teal-700",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* ===== Hero ===== */}
      <section className="flex items-center justify-around bg-white text-neutral-950 h-80 px-6">
        {/* Logo Kiri */}
        <div className="hidden md:flex items-end">
          <Image
            src="/images/logo/helpcenter_1.webp"
            alt="Logo Help Center"
            width={320}
            height={200}
            unoptimized
            className="object-contain"
          />
        </div>

        {/* Judul */}
        <h1 className="text-4xl md:text-6xl font-semibold italic text-center">
          Need some help?
        </h1>

        {/* Logo Kanan */}
        <div className="hidden md:flex items-end">
          <Image
            src="/images/logo/helpcenter.webp"
            alt="Logo Help Center"
            width={250}
            height={180}
            unoptimized
            className="object-contain"
          />
        </div>
      </section>

      {/* ===== Browse Topics ===== */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="mb-8 text-center text-2xl font-semibold text-gray-900">
          Browse Topics
        </h2>

        {/* 
          Grid 4 kolom — sama persis seperti Gojek.
          Di mobile jadi 2 kolom agar tidak terlalu sempit.
        */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Link
                key={topic.slug}
                href={`/help/${topic.slug}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 
                           bg-white px-4 py-3.5 transition-all duration-200 
                           hover:border-gray-300 hover:bg-gray-50"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center 
                                 rounded-full ${colorMap[topic.color]}`}
                >
                  <Icon size={18} />
                </div>
                <span className="text-sm font-medium leading-tight text-gray-800">
                  {topic.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
