"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DataTable, { TableStyles } from "react-data-table-component";

/* ================= TYPES ================= */

export type Event = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  price: number;
  quota?: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  company: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
};

/* ================= COMPONENT ================= */

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cadmin/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data?.data || data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (event: Event) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const res = await fetch(`/api/cadmin/events/${event.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    }
  };

  /* ================= COLUMNS ================= */

  const columns = [
    {
      name: "#",
      cell: (_row: Event, index: number) => index + 1,
      width: "60px",
    },
    {
      name: "Image",
      cell: (row: Event) =>
        row.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.coverImage}
            alt={row.coverImage}
            className="h-8 w-auto object-contain"
          />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        ),
      width: "140px",
    },
    {
      name: "Title",
      selector: (row: Event) => row.title,
      sortable: true,
      wrap: true,
    },
    {
      name: "Category",
      selector: (row: Event) => row.category?.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Company",
      selector: (row: Event) => row.company?.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Price",
      cell: (row: Event) =>
        row.price === 0 ? (
          <span className="text-green-600 font-medium">FREE</span>
        ) : (
          `Rp ${row.price.toLocaleString("id-ID")}`
        ),
      sortable: true,
      width: "130px",
    },
    {
      name: "Date",
      cell: (row: Event) => (
        <div className="text-sm">
          <div>{new Date(row.startDate).toLocaleDateString("id-ID")}</div>
          <div className="text-gray-500">
            → {new Date(row.endDate).toLocaleDateString("id-ID")}
          </div>
        </div>
      ),
      wrap: true,
      width: "170px",
    },
    {
      name: "Status",
      cell: (row: Event) => (
        <span
          className={
            row.isPublished
              ? "text-green-600 font-medium"
              : "text-red-600 font-medium"
          }
        >
          {row.isPublished ? "Published" : "Draft"}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Action",
      cell: (row: Event) => (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/cadmin/events/edit/${row.id}`}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
          >
            Edit
          </Link>

          <Link
            href={`/cadmin/events/${row.id}/attendee-fields`}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
          >
            Attendee Fields
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

  /* ================= TABLE STYLES ================= */

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

  /* ================= UI ================= */

  return (
    <div className="flex-1 bg-gray-50 min-h-screen px-4 py-10">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Events Management</h2>

          <Link
            href="/cadmin/events/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Event
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4">
          <DataTable
            columns={columns}
            data={events}
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
