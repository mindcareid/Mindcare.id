"use client";

import DataTable from "react-data-table-component";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";

type HeroSlider = {
  id: number;
  title?: string;
  subtitle?: string;
  image?: string;
  alignText?: string;
  order: number;
  isActive: boolean;
  created_at?: string;
};

export default function HeroList() {
  const [data, setData] = useState<HeroSlider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hero")
      .then((res) => res.json())
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      name: "Image",
      cell: (row: HeroSlider) =>
        row.image ? (
          <Image
            src={row.image}
            alt={row.title || "Hero Image"}
            width={56}
            height={48}
            className="rounded object-cover"
          />
        ) : (
          "-"
        ),
    },
    { name: "Title", selector: (row: HeroSlider) => row.title || "-" , wrap: true },
    { name: "Subtitle", selector: (row: HeroSlider) => row.subtitle || "-", wrap: true },
    { name: "Align", selector: (row: HeroSlider) => row.alignText || "-" },
    { name: "Order", selector: (row: HeroSlider) => row.order.toString() },
    { name: "Active", selector: (row: HeroSlider) => (row.isActive ? "Yes" : "No") },
    {
      name: "Created At",
      selector: (row: HeroSlider) =>
        row.created_at ? format(new Date(row.created_at), "yyyy-MM-dd") : "-",
    },
    {
      name: "Actions",
      cell: (row: HeroSlider) => (
        <div className="flex gap-2">
          <Link
            href={`/cadmin/hero/edit/${row.id}`}
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Edit
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full overflow-x-auto">
    <div className="flex flex-wrap justify-between mb-4 gap-2">
      <h1 className="text-xl font-bold">Hero Sliders</h1>
      <Link
        href="/cadmin/hero/create"
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        + Add Hero
      </Link>
    </div>

    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        pagination
        responsive
        highlightOnHover
        striped
      />
    </div>
  </div>
  );
}
