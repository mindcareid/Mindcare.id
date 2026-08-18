"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import DataTable, { TableStyles } from "react-data-table-component";

type User = {
    id: number;
    name: string;
    email: string;
    phonenumber: string;
    photo: string;
    bio: string;
    role: string;
    publicId: string;
};

export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const filteredData = users.filter((item) =>
    (item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.email?.toLowerCase().includes(search.toLowerCase()))
    );

    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetch("/api/user")
            .then((res) => res.json())
            .then((data) => {
                setUsers(data?.data || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        const res = await fetch(`/api/user?id=${id}`, { method: "DELETE" });
        if (res.ok) {
            setUsers((prev) => prev.filter((u) => u.id !== id));
        }
    };

    const columns = [
        {
            name: "#",
            selector: (row: User) => row.id,
            sortable: true,
            width: "60px",
            wrap: true,
        },
        {
            name: "Name",
            selector: (row: User) => row.name,
            sortable: true,
            wrap: true,
        },
        {
            name: "Email",
            selector: (row: User) => row.email,
            sortable: true,
            wrap: true,
        },
        {
            name: "Phone",
            selector: (row: User) => row.phonenumber,
            wrap: true,
        },
        {
            name: "Role",
            selector: (row: User) => row.role,
            wrap: true,
        },
        {
            name: "Image",
            cell: (row: User) => {
                const userInitial = row.name
                    ? row.name.charAt(0).toUpperCase()
                    : "?";

                return row.photo ? (
                    <Image
                        src={row.photo}
                        width={40}
                        height={40}
                        alt="User"
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {userInitial}
                    </div>
                );
            },
            width: "80px",
        },
        {
            name: "Action",
            cell: (row: User) => (
                <div className="flex flex-wrap gap-2 justify-start items-center">
                    <Link
                        href={`/cadmin/user/edit/${row.id}`}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => handleDelete(row.id)}
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
                    <h2 className="text-2xl font-semibold">User Management</h2>
                    <Link
                        href="/cadmin/user/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        + Add User
                    </Link>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <DataTable
                        key={rowsPerPage}
                        columns={columns}
                        data={filteredData}
                        progressPending={loading}
                        pagination
                        paginationRowsPerPageOptions={[5, 10, 20, 50, 100]}
                        paginationPerPage={rowsPerPage}
                        onChangeRowsPerPage={(newPerPage) => {
                            setRowsPerPage(newPerPage);
                        }}
                        responsive
                        highlightOnHover
                        striped
                        customStyles={customStyles}
                        subHeader
                        subHeaderComponent={
                            <div className="flex justify-between w-full">
                                {/* Kiri: Dropdown bawaan pagination */}
                                <div><select
                                    value={rowsPerPage}
                                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                    className="border px-3 py-2 rounded"
                                >
                                    {[5, 10, 20, 50, 100].map((num) => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                </select></div>
                                {/* Kanan: Search box */}
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="border px-3 py-2 rounded w-64"
                                />
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    );
}
