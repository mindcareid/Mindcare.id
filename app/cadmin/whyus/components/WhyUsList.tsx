"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";

export type WhyUs = {
  id: number;
  title: string;
  description?: string;
  image?: string;
  publicId?: string;
  hoverImg?: string;
  hoverPublicId?: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function WhyUsList() {
  const [whyUsList, setWhyUsList] = useState<WhyUs[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    fetch("/api/whyus")
      .then((res) => res.json())
      .then((res) => setWhyUsList(res?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     DELETE HANDLER (SAFE)
  ========================= */
  const handleDelete = async (item: WhyUs) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      /* ---------- Delete image via SERVER API ---------- */
      if (item.publicId) {
        const cloudRes = await fetch("/api/cloudinary/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_id: item.publicId }),
        });

        if (!cloudRes.ok) {
          throw new Error("Failed to delete image from Cloudinary");
        }
      }

      /* ---------- Delete from DB ---------- */
      const res = await fetch(`/api/whyus?id=${item.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete data");
      }

      setWhyUsList((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete this item.");
    }
  };

  /* =========================
     TABLE COLUMNS
  ========================= */
  const columns: TableColumn<WhyUs>[] = [
    {
      name: "#",
      cell: (_row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
    },
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
      wrap: true,
    },
    {
      name: "Description",
      cell: (row) => (
        <div
          className="max-w-62.5 truncate"
          dangerouslySetInnerHTML={{
            __html:
              row.description && row.description.length > 100
                ? `${row.description.slice(0, 100)}...`
                : row.description || "-",
          }}
        />
      ),
    },
    {
      name: "Image",
      cell: (row) => (
        <Image
          src={row.image?.trim() ? row.image : "/images/no-image.png"}
          width={60}
          height={60}
          alt="Why Us"
          className="rounded object-cover"
        />
      ),
      width: "80px",
    },
    {
      name: "Hover Image",
      cell: (row) => (
        <Image
          src={row.hoverImg?.trim() ? row.hoverImg : "/images/no-image.png"}
          width={60}
          height={60}
          alt="Why Us Hover"
          className="rounded object-cover"
        />
      ),
      width: "80px",
    },
    {
      name: "Status",
      cell: (row) => (
        <span className={row.isActive ? "text-green-600" : "text-red-600"}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
      width: "100px",
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex gap-2">
          <Link
            href={`/cadmin/whyus/edit/${row.id}`}
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
    },
  ];

  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "15px",
        backgroundColor: "#f3f4f6",
      },
    },
    cells: {
      style: { fontSize: "14px" },
    },
    rows: {
      style: { minHeight: "60px" },
    },
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen px-4 py-10">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Why Us Management</h2>
          <Link
            href="/cadmin/whyus/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Why Us
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4">
          <DataTable
            columns={columns}
            data={whyUsList}
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
