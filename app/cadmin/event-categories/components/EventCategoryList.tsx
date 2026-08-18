"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DataTable, { TableStyles } from "react-data-table-component";

export type EventCategory = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function EventCategoryList() {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/event-categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data?.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (row: EventCategory) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    const res = await fetch(`/api/event-categories?id=${row.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== row.id));
    }
  };

  const columns = [
    {
      name: "#",
      cell: (_row: EventCategory, index: number) => index + 1,
      width: "60px",
    },
    {
      name: "Name",
      selector: (row: EventCategory) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Slug",
      selector: (row: EventCategory) => row.slug,
      wrap: true,
    },
    {
      name: "Status",
      cell: (row: EventCategory) => (
        <span
          className={
            row.isActive ? "text-green-600 font-medium" : "text-red-600 font-medium"
          }
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Action",
      cell: (row: EventCategory) => (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/cadmin/event-categories/edit/${row.id}`}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
          >
            Edit
          </Link>

          <button
            onClick={() => handleDelete(row)}
            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
          >
            Delete
          </button>
        </div>
      ),
      wrap: true,
    },
  ];

  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "15px",
        backgroundColor: "#f3f4f6",
        whiteSpace: "normal",
      },
    },
    cells: {
      style: {
        whiteSpace: "normal",
        wordBreak: "break-word",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        minHeight: "60px",
      },
    },
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen px-4 py-10">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Event Category Management</h2>

          <Link
            href="/cadmin/event-categories/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Category
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4">
          <DataTable
            columns={columns}
            data={categories}
            progressPending={loading}
            pagination
            responsive
            highlightOnHover
            striped
            customStyles={customStyles}
          />
        </div>
      </div>
    </div>
  );
}
