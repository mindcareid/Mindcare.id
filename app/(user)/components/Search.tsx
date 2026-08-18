"use client";

import { formatDate, sameDate } from "@/lib/utils/FormatDate";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

type EventSearch = {
  id: number;
  title: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  location: string;
  slug: string;
};

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EventSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      setError(null);
      return;
    }

    const delay = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);
      setOpen(true);
      try {
        const res = await fetch(
          `/api/events/search?q=${encodeURIComponent(trimmed)}`,
          { signal: abortRef.current.signal },
        );

        if (!res.ok) throw new Error("Failed fetch search");

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setResults(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Search error", err);
        setError("Failed to fetch results, please try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const handleSearchSubmit = () => {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/events?search=${encodeURIComponent(query.trim())}`);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setError(null);
  };

  return (
    <section ref={wrapperRef} className="relative w-full">
      <div className="grid grid-cols-1 md:flex gap-2 items-center">
        <div className="relative flex-1 min-w-0">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-xl z-10" />

          <input
            type="text"
            placeholder="Search events, workshops, or seminars..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2) setOpen(true);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            className="w-full px-6 py-4 pl-14 pr-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1"
              aria-label="Clear search"
            >
              <FiX className="text-lg" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearchSubmit}
          className="shrink-0 px-5 py-4 my-2 bg-blue-600 hover:bg-blue-700  rounded-2xl font-semibold text-white transition-all text-sm md:text-base md:px-8"
        >
          Search
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute mt-3 w-full bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
          >
            {loading && (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-center animate-pulse"
                  >
                    <div className="w-14 h-14 rounded-lg bg-white/10 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="p-6 text-center text-red-400 text-sm">
                {error}
              </div>
            )}

            {!loading && !error && results.length === 0 && (
              <div className="p-6 text-center text-gray-400">
                No events found for &quot;{query}&quot;
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                {results.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex gap-4 items-center p-4 hover:bg-white/5 transition"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold line-clamp-1">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {event.location}
                      </p>
                      <p className="text-sm text-gray-500">
                        {sameDate(event.startDate, event.endDate)
                          ? formatDate(event.startDate)
                          : `${formatDate(event.startDate)}-${formatDate(event.endDate)}`}
                      </p>
                    </div>
                  </Link>
                ))}

                <button
                  onClick={handleSearchSubmit}
                  className="w-full p-4 text-center text-sm text-blue-400 hover:text-blue-300 hover:bg-white/5 transition border-t border-white/10"
                >
                  See all result for &quot;{query}&quot; →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
