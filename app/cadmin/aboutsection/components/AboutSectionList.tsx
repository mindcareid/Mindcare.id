"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TableColumn } from "react-data-table-component";
import DataTable from "react-data-table-component";
import Image from "next/image";
import Link from "next/link";

/* =========================
   Types
========================= */

type ImagePosition = "LEFT" | "RIGHT" | "CENTER";

type AboutSection = {
  id: number;
  title: string;
  imageUrl: string | null;
  orderIndex: number;
  imagePosition: ImagePosition;
  isActive: boolean;
};

type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};

/* =========================
   Component
========================= */

export default function AboutSectionList() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     Fetch Data
  ========================= */

  const fetchSections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/about-section");

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }

      const result: ApiResponse<AboutSection[]> = await res.json();

      if (result.status === 200) {
        setSections(result.data);
      } else {
        setError(result.message || "Unexpected error");
      }
    } catch (err) {
      console.error("Error fetching about sections:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleDelete = useCallback(
  async (id: number) => {
    const ok = confirm("Are you sure you want to delete this section?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/about-section?id=${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Failed to delete");
        return;
      }

      fetchSections();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  },
  [fetchSections]
);

  /* =========================
     Columns
  ========================= */

  const columns: TableColumn<AboutSection>[] = useMemo(
    () => [
      {
        name: "ID",
        selector: (row) => row.id,
        sortable: true,
        width: "70px",
      },
      {
        name: "Title",
        selector: (row) => row.title,
        sortable: true,
        wrap: true,
      },
      {
        name: "Image",
        cell: (row) => (
          <Image
            src={row.imageUrl ?? "/images/no-image.png"}
            alt={row.title}
            width={60}
            height={40}
            className="rounded-md object-cover"
          />
        ),
        width: "90px",
      },
      {
        name: "Order",
        selector: (row) => row.orderIndex,
        sortable: true,
        width: "80px",
      },
      {
        name: "Position",
        selector: (row) => row.imagePosition,
        width: "110px",
      },
      {
        name: "Status",
        cell: (row) => (
          <span
            className={`px-2 py-1 text-xs rounded font-medium ${row.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
              }`}
          >
            {row.isActive ? "Active" : "Inactive"}
          </span>
        ),
        width: "110px",
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="flex gap-2">
            <Link
              href={`/cadmin/aboutsection/edit/${row.id}`}
              className="text-xs px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Edit
            </Link>

            <button
              onClick={() => handleDelete(row.id)}
              className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ),
        width: "160px",
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [handleDelete]
  );

  /* =========================
     Render
  ========================= */

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">About Sections</h2>
        <Link
          href="/cadmin/aboutsection/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          + Add Section
        </Link>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={sections}
        progressPending={loading}
        pagination
        highlightOnHover
        responsive
        noDataComponent={
          <div className="py-6 text-gray-500">No data available</div>
        }
        customStyles={{
          rows: {
            style: {
              minHeight: "72px",
            },
          },
        }}
      />
    </div>
  );
}
