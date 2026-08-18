"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMapPin, FiSearch, FiArrowUpRight } from "react-icons/fi";

type Company = {
  id: number;
  slug: string;
  name: string;
  logo: string | null;
  location: string | null;
};

type Props = {
  companies: Company[];
};

export default function PartnerGrid({ companies }: Props) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q),
    );
  }, [companies, query]);

  return (
    <section className="bg-[#F2F1EC]">
      {/* Header band - ink navy, berfungsi sebagai "sampul" directory sebelum masuk ke grid */}
      <div className="bg-[#12213F] px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-500">
            Verified Partners · Directory
          </p>
          <h1 className="mt-5 max-w-2xl font-serif text-4xl font-medium leading-[1.1] text-[#F7F5EE] sm:text-5xl">
            Our Partners Directory
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#AEB4C4] sm:text-xl">
            {companies.length} organizations we&apos;ve partnered with to bring
            events, ideas, and opportunities into the room.
          </p>
          <div className="mt-8 flex max-w-md items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-3 backdrop-blur-sm transition-colors focus-within:border-blue-500">
            <FiSearch className="h-4 w-4 shrink-0 text-[#AEB4C4]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search partner or city..."
              className="w-full bg-transparent text-sm text-[#F7F5EE] placeholder:text-[#7C84A0] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid directory */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D3D0C4] bg-white/50 py-20 text-center">
            <p className="font-serif text-lg text-[#12213F]">
              No partners match &ldquo;{query}&rdquo;
            </p>
            <p className="mt-1 text-sm text-[#7A7568]">
              Try a different name or city.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((company, index) => (
              <Link
                key={company.id}
                href={`/partners/${company.slug}`}
                className="group relative flex flex-col rounded-2xl border border-[#E3E0D4] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-[0_12px_30px_-12px_rgba(18,33,63,0.25)] focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <div className="mb-4 flex items-center justify-between font-mono text-[12px] uppercase tracking-wider text-[#9B9587]">
                  {company.location && (
                    <span className="flex min-w-0 items-center gap-1">
                      <FiMapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{company.location}</span>
                    </span>
                  )}
                </div>

                <div className="flex h-20 items-center justify-center">
                  <Image
                    src={company.logo ?? "/images/no-image.png"}
                    alt={company.name}
                    width={120}
                    height={72}
                    className="max-h-14 w-auto object-contain  transition-all duration-300 "
                  />
                </div>

                <h3 className="mt-4 line-clamp-1 text-center text-sm font-semibold text-[#12213F]">
                  {company.name}
                </h3>

                <div className="mt-3 flex translate-y-1 items-center justify-center gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-blue-500">
                    View profile
                  </span>
                  <FiArrowUpRight className="h-3.5 w-3.5 text-blue-500 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
