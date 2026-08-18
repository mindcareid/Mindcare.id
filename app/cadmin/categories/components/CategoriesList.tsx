"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import DataTable, { TableStyles } from "react-data-table-component";

export type Categories = {
  id: number;
  slug: string;
  title: string;
  publicId: string;
  photo?: string;
  content?: string;
  isactive: boolean;
  createdAt: string;
  updatedAt: string;
};


export default function CategoriesList() {
  const [categoriess, setCategoriess] = useState<Categories[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategoriess(data?.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (categories: Categories) => {
    if (!confirm("Are you sure you want to delete this categories?")) return;

    try {
      // 🔥 DELETE IMAGE VIA SERVER
      if (categories.publicId) {
        const imgRes = await fetch("/api/cloudinary/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_id: categories.publicId,
          }),
        });

        const imgResult = await imgRes.json();
        if (imgResult.result !== "ok") {
          throw new Error("Failed to delete image");
        }
      }
      // Delete from DB
      const res = await fetch(`/api/categories?id=${categories.id}`, { method: "DELETE" });

      if (res.ok) {
        setCategoriess((prev) => prev.filter((s) => s.id !== categories.id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete the categories.");
    }
  };

  const columns = [
    {
      name: "#",
      cell: (_row: Categories, index: number) => index + 1,
      width: "60px",
      wrap: true,
    },
    {
      name: "Title",
      selector: (row: Categories) => row.title,
      sortable: true,
      wrap: true,
    },
    {
      name: "Slug",
      selector: (row: Categories) => row.slug,
      wrap: true,
    },
    {
      name: "Image",
      cell: (row: Categories) => (
        <Image
          src={row.photo || "/images/no-image.png"}
          width={60}
          height={60}
          alt="Categories"
          className="rounded object-cover"
        />
      ),
      width: "80px",
    },
    {
      name: "Status",
      cell: (row: Categories) => (
        <span className={row.isactive ? "text-green-600" : "text-red-600"}>
          {row.isactive ? "Active" : "Inactive"}
        </span>
      ),
      width: "100px",
    },
    {
      name: "Action",
      cell: (row: Categories) => (
        <div className="flex flex-wrap gap-2 justify-start items-center">
          <Link
            href={`/cadmin/categories/edit/${row.id}`}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
          >
            Edit
          </Link>
          <Link href={`categoriessub?categoriesId=${row.id}`}
            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm">
            Sub-Categories
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
          <h2 className="text-2xl font-semibold">Categories Management</h2>
          <Link
            href="/cadmin/categories/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Categories
          </Link>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <DataTable
            columns={columns}
            data={categoriess}
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
