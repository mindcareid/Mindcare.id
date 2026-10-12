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
    <section className="bg-background">
      <div className="bg-brand-navy-950 px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-brand-mint-200">
            Verified Partners · Directory
          </p>
          <h1 className="mt-5 max-w-2xl font-heading text-4xl font-medium leading-[1.1] text-white sm:text-5xl">
            Our Partners Directory
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70 sm:text-xl">
            {companies.length} organizations we&apos;ve partnered with to bring
            events, ideas, and opportunities into the room.
          </p>
          <div className="mt-8 flex w-full max-w-md items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 shadow-search transition-colors focus-within:ring-2 focus-within:ring-ring">
            <FiSearch className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search partner or city..."
              className="h-6 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid directory */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card py-20 text-center">
            <p className="font-heading text-lg text-foreground">
              No partners match &ldquo;{query}&rdquo;
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different name or city.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((company, index) => (
              <Link
                key={company.id}
                href={`/partners/${company.slug}`}
                className="group relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-card transition-shadow duration-300 hover:border-primary hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
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

                <h3 className="mt-4 line-clamp-1 text-center text-sm font-semibold text-foreground">
                  {company.name}
                </h3>

                <div className="mt-3 flex translate-y-1 items-center justify-center gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="text-xs font-medium text-primary">
                    View profile
                  </span>
                  <FiArrowUpRight className="h-3.5 w-3.5 text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
