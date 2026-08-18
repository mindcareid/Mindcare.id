"use client";

import { useMemo, useState } from "react";
import { Order } from "@prisma/client";
import Link from "next/link";
import { formatDate } from "@/lib/utils/FormatDate";

interface OrderWithEvent extends Order {
    event: {
        title: string;
        startDate: Date;
        location?: string | null;
    };
    _count: {
        ticket: number;
    };
}

const ITEMS_PER_PAGE = 6;



export default function OrderList({ orders }: { orders: OrderWithEvent[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<"date" | "name">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    /* ================= SORT ================= */

    const sortedOrders = useMemo(() => {
        const sorted = [...orders];

        sorted.sort((a, b) => {
            if (sortBy === "date") {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();

                return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
            }

            if (sortBy === "name") {
                const nameA = a.event.title.toLowerCase();
                const nameB = b.event.title.toLowerCase();

                if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
                if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
            }

            return 0;
        });

        return sorted;
    }, [orders, sortBy, sortOrder]);

    /* ================= PAGINATION ================= */

    const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;

        return sortedOrders.slice(start, end);
    }, [sortedOrders, currentPage]);

    if (orders.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500">
                <h2 className="text-xl font-semibold mb-2">🧾 No Orders Yet</h2>
                <p>You have not registered for any events.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mt-10 mx-auto">
            <h1 className="text-2xl font-bold mb-6">🧾 My Orders</h1>

            {/* SORT */}

            <div className="flex gap-3 mb-4">
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "date" | "name")}
                    className="border px-3 py-1 rounded text-sm"
                >
                    <option value="date">Sort by Created Date</option>
                    <option value="name">Sort by Event Name</option>
                </select>

                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                    className="border px-3 py-1 rounded text-sm"
                >
                    <option value="desc">Newest</option>
                    <option value="asc">Oldest</option>
                </select>
            </div>

            {/* TABLE */}

            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Event</th>
                            <th className="p-3">Tickets</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Created</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedOrders.map((order) => (
                            <OrderRow key={order.id} order={order} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-40"
                    >
                        Prev
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1;

                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 border rounded text-sm ${page === currentPage ? "bg-blue-600 text-white" : ""
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

/* ================= ORDER ROW ================= */

function OrderRow({ order }: { order: OrderWithEvent }) {
    const statusColor = {
        PAID: "bg-green-100 text-green-700",
        PENDING: "bg-yellow-100 text-yellow-700",
        EXPIRED: "bg-red-100 text-red-700",
        CANCELED: "bg-gray-200 text-gray-600",
    }[order.status];

    return (
        <tr className="border-t">
            <td className="p-3 font-mono text-xs">{order.id}</td>

            <td className="p-3">
                <div className="font-semibold">{order.event.title}</div>
                <div className="text-xs text-gray-500">
                    {formatDate(order.event.startDate)}
                </div>
            </td>

            <td className="p-3 text-center font-semibold">
                {order._count.ticket}
            </td>

            <td className="p-3">
                Rp {order.amount.toLocaleString("id-ID")}
            </td>

            <td className="p-3">
                <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${statusColor}`}
                >
                    {order.status}
                </span>
            </td>

            <td className="p-3 text-xs text-gray-500">
                {formatDate(order.createdAt)}
            </td>

            <td className="p-3 flex gap-2">
                {order.status === "PENDING" && order.invoiceUrl && (
                    <a
                        href={order.invoiceUrl}
                        target="_blank"
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                    >
                        Pay
                    </a>
                )}

                {order.status === "PAID" && (
                    <Link
                        href={`/dashboard/my-ticket?orderId=${order.id}`}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                    >
                        View Ticket
                    </Link>
                )}
            </td>
        </tr>
    );
}