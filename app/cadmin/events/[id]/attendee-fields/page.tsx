"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import DataTable, { TableStyles } from "react-data-table-component";

/* ================= TYPES ================= */

export type AttendeeField = {
  id: number;
  label: string;
  type: "TEXT" | "EMAIL" | "PHONE" | "NUMBER" | "SELECT" | "CHECKBOX";
  required: boolean;
  options?: string[];
  createdAt: string;
};

/* ================= COMPONENT ================= */

export default function AttendeeFieldList() {
  const params = useParams();
  //const eventId = params?.id;
  const eventId =
  typeof params?.id === "string"
    ? Number(params.id)
    : Array.isArray(params?.id)
    ? Number(params.id[0])
    : undefined;

  const [fields, setFields] = useState<AttendeeField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    fetch(`/api/cadmin/events/${eventId}/attendee-fields`)
      .then((res) => res.json())
      .then((data) => {
        setFields(data?.data || data || []);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleDelete = async (field: AttendeeField) => {
    if (!confirm("Delete this attendee field?")) return;

    const res = await fetch(
      `/api/cadmin/events/${eventId}/attendee-fields/${field.id}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setFields((prev) => prev.filter((f) => f.id !== field.id));
    }
  };

  /* ================= COLUMNS ================= */

  const columns = [
    {
      name: "#",
      cell: (_row: AttendeeField, index: number) => index + 1,
      width: "60px",
    },
    {
      name: "Label",
      selector: (row: AttendeeField) => row.label,
      sortable: true,
      wrap: true,
    },
    {
      name: "Type",
      selector: (row: AttendeeField) => row.type,
      sortable: true,
      width: "140px",
    },
    {
      name: "Required",
      cell: (row: AttendeeField) => (
        <span
          className={
            row.required
              ? "text-green-600 font-medium"
              : "text-gray-500"
          }
        >
          {row.required ? "Yes" : "No"}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Options",
      cell: (row: AttendeeField) =>
        row.options?.length ? (
          <ul className="list-disc pl-4 text-sm">
            {row.options.map((opt, idx) => (
              <li key={idx}>{opt}</li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
      wrap: true,
    },
    {
      name: "Action",
      cell: (row: AttendeeField) => (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/cadmin/events/${eventId}/attendee-fields/edit/${row.id}`}
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
        minHeight: "56px",
      },
    },
  };

  /* ================= UI ================= */

  return (
    <div className="flex-1 bg-gray-50 min-h-screen px-4 py-10">
      <div className="container mx-auto">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">
              Attendee Fields
            </h2>
            <p className="text-sm text-gray-500">
              Event ID: {eventId}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/cadmin/events"
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              ← Back
            </Link>

            <Link
              href={`/cadmin/events/${eventId}/attendee-fields/create`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              + Add Field
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4">
          <DataTable
            columns={columns}
            data={fields}
            progressPending={loading}
            pagination
            responsive
            highlightOnHover
            striped
            customStyles={customStyles}
            noDataComponent="No attendee fields found"
          />
        </div>
      </div>
    </div>
  );
}