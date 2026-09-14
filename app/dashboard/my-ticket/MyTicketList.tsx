"use client";

import { useMemo, useState } from "react";
import { Ticket as PrismaTicket, OrderStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineTicket } from "react-icons/hi2";
import { FiSearch } from "react-icons/fi";
interface TicketWithEvent extends PrismaTicket {
  order: {
    status: OrderStatus;
    event: { title: string; startDate: Date; location?: string | null };
  };
}

const ITEMS_PER_PAGE = 4;

export default function MyTicketList({
  tickets,
}: {
  tickets: TicketWithEvent[];
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(tickets.length / ITEMS_PER_PAGE);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return tickets.slice(start, end);
  }, [tickets, currentPage]);

  if (tickets.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-blue-50 flex items-center justify-center">
            <HiOutlineTicket className="w-11 h-11 md:w-14 md:h-14 text-blue-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-200" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-purple-200" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
          No tickets yet
        </h2>
        <p className="text-gray-500 text-sm md:text-base max-w-xs leading-relaxed mb-8">
          You haven&apos;t registered for any events. Browse upcoming events and
          secure your spot today.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all hover:scale-105"
        >
          <FiSearch className="w-4 h-4" />
          Browse Events
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mt-10 mx-auto">
      <h1 className="text-2xl font-bold mb-6">🎟️ My Tickets</h1>

      {/* TICKET GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paginatedTickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border text-sm disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded text-sm border ${
                  page === currentPage
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= TICKET CARD ================= */

function TicketCard({ ticket }: { ticket: TicketWithEvent }) {
  const displayStatus: "PAID" | "PENDING" | "EXPIRED" | "CANCELED" | "REFUNDED" =
    ticket.order.status === "PAID" ||
    ticket.order.status === "PENDING" ||
    ticket.order.status === "REFUNDED" ||
    ticket.order.status === "CANCELED" || 
    ticket.order.status === "EXPIRED"
      ? ticket.order.status
      : "PENDING";

      const statusColor =
  displayStatus === "PAID"
    ? "bg-green-100 text-green-700"
    : displayStatus === "REFUNDED"
      ? "bg-purple-100 text-purple-700"
      : displayStatus === "CANCELED"
        ? "bg-red-100 text-red-700"
        : displayStatus === "EXPIRED"
          ? "bg-gray-100 text-gray-700"
          : "bg-yellow-100 text-yellow-700";

  return (
    <div className="border rounded-xl p-5 shadow-sm bg-white">
      {/* EVENT INFO */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{ticket.order.event.title}</h2>
        <p className="text-sm text-gray-600">
          📅{" "}
          {new Date(ticket.order.event.startDate).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
        {ticket.order.event.location && (
          <p className="text-sm text-gray-600">
            📍 {ticket.order.event.location}
          </p>
        )}
      </div>

      {/* STATUS */}
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
        >
          {displayStatus}
        </span>
      </div>

      {/* ATTENDEE + QR */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm">
            <span className="font-semibold">Name:</span> {ticket.attendeeName}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Email:</span> {ticket.attendeeEmail}
          </p>
          <p className="mt-2 text-xs text-gray-500">Ticket Code</p>
          <p className="font-mono text-sm">{ticket.code}</p>
        </div>

        {ticket.qrCode && (
          <Image
            src={ticket.qrCode.trim()}
            alt="QR Ticket"
            width={96}
            height={96}
            className="border rounded-md"
          />
        )}
      </div>
    </div>
  );
}
