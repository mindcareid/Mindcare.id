"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdSearch } from "react-icons/md";

export function HelpSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Nanti bisa diarahkan ke halaman hasil search
    router.push(`/company/help/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md">
      <div className="relative">
        <MdSearch
          size={22}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for help topics..."
          className="w-full rounded-full border-0 bg-white py-3.5 pl-12 pr-5 
                     text-sm text-gray-900 shadow-md outline-none 
                     focus:ring-2 focus:ring-white/60"
        />
      </div>
    </form>
  );
}
