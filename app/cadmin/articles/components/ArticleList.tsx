"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DataTable, { TableStyles } from "react-data-table-component";

/* ================= TYPES ================= */

export type Article = {
  id: number;
  title: string;
  slug: string;
  coverImage?: string | null;
  type: "BLOG" | "NEWS";
  category:
    | "CORPORATE"
    | "EXECUTIVE"
    | "INSIGHT"
    | "UPDATE"
    | "EVENT";
  published: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/* ================= COMPONENT ================= */

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data?.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (row: Article) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    const res = await fetch(`/api/articles?id=${row.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setArticles((prev) => prev.filter((a) => a.id !== row.id));
    }
  };

  /* ================= COLUMNS ================= */

  const columns = [
    {
      name: "#",
      cell: (_row: Article, index: number) => index + 1,
      width: "60px",
    },
    {
      name: "Title",
      selector: (row: Article) => row.title,
      sortable: true,
      wrap: true,
      grow: 2,
    },
    {
      name: "Type",
      selector: (row: Article) => row.type,
      width: "110px",
    },
    {
      name: "Category",
      selector: (row: Article) => row.category,
      wrap: true,
      width: "150px",
    },
    {
      name: "Cover",
      cell: (row: Article) =>
        row.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.coverImage}
            alt={row.title}
            className="h-10 w-16 object-cover rounded"
          />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        ),
      width: "120px",
    },
    {
      name: "Publish",
      cell: (row: Article) => (
        <span
          className={
            row.published
              ? "text-green-600 font-medium"
              : "text-yellow-600 font-medium"
          }
        >
          {row.published ? "Published" : "Draft"}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Status",
      cell: (row: Article) => (
        <span
          className={
            row.isActive ? "text-green-600" : "text-red-600"
          }
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
      width: "110px",
    },
    {
      name: "Action",
      cell: (row: Article) => (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/cadmin/articles/edit/${row.id}`}
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

  /* ================= TABLE STYLE ================= */

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
        minHeight: "64px",
      },
    },
  };

  /* ================= UI ================= */

  return (
    <div className="flex-1 bg-gray-50 min-h-screen px-4 py-10">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Article Management</h2>

          <Link
            href="/cadmin/articles/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Article
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4">
          <DataTable
            columns={columns}
            data={articles}
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
