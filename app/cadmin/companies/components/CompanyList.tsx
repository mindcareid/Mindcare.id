"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DataTable, { TableStyles } from "react-data-table-component";

export type Company = {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cadmin/companies")
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data?.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (row: Company) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    const res = await fetch(`/api/cadmin/companies?id=${row.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setCompanies((prev) => prev.filter((c) => c.id !== row.id));
    }
  };

  const columns = [
    {
      name: "#",
      cell: (_row: Company, index: number) => index + 1,
      width: "60px",
    },
    {
      name: "Name",
      selector: (row: Company) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Slug",
      selector: (row: Company) => row.slug,
      wrap: true,
    },
    {
      name: "Logo",
      cell: (row: Company) =>
        row.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.logo}
            alt={row.name}
            className="h-8 w-auto object-contain"
          />
        ) : (
          <span className="text-gray-400 text-sm">No logo</span>
        ),
      width: "140px",
    },
    {
      name: "Status",
      cell: (row: Company) => (
        <span className={row.isActive ? "text-green-600" : "text-red-600"}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
      width: "110px",
    },
    {
      name: "Action",
      cell: (row: Company) => (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/cadmin/companies/edit/${row.id}`}
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
          <h2 className="text-2xl font-semibold">Company Management</h2>

          {/* <Link
            href="/cadmin/companies/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Company
          </Link> */}
        </div>

        <div className="bg-white shadow-md rounded-lg p-4">
          <DataTable
            columns={columns}
            data={companies}
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
