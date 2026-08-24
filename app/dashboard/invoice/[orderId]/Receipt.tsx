"use client";

import Image from "next/image";
import { CheckCircle2, Clock3, Printer, XCircle } from "lucide-react";

import { formatDate } from "@/lib/utils/FormatDate";
import DownloadPdf from "./DownloadPdf";
import type { OrderEvent } from "@/lib/orders";

import type { Prisma } from "@prisma/client";

type XenditPayload = Prisma.JsonObject & {
  payment_method?: string;
  payment_channel?: string;
  bank_code?: string;
};

interface Props {
  order: OrderEvent;
}

export default function Receipt({ order }: Props) {
  const buyer = order.user;

  const paymentLog = [...order.paymentLogs]
    .reverse()
    .find((log) => log.status === "PAID" || log.status === "SETTLED");

  const payload = paymentLog?.payload as XenditPayload | undefined;

  const paymentMethod = payload
    ? [payload.payment_method, payload.payment_channel ?? payload.bank_code]
        .filter(Boolean)
        .join(" - ")
    : order.amount === 0
      ? "Free"
      : "-";

  const statusMap = {
    PAID: {
      color: "bg-green-100 text-green-700",
      icon: <CheckCircle2 size={16} />,
    },
    PENDING: {
      color: "bg-yellow-100 text-yellow-700",
      icon: <Clock3 size={16} />,
    },
    EXPIRED: {
      color: "bg-red-100 text-red-700",
      icon: <XCircle size={16} />,
    },
    CANCELED: {
      color: "bg-gray-100 text-gray-700",
      icon: <XCircle size={16} />,
    },
  } as const;

  const status =
    statusMap[order.status as keyof typeof statusMap] ?? statusMap.PENDING;

  return (
    <div className="space-y-6">
      {/* Toolbar */}

      <div className="flex justify-end gap-3 print:hidden">
        <DownloadPdf orderId={order.id} />

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          <Printer size={18} />
          Print
        </button>
      </div>

      {/* Receipt */}

      <div
        id="receipt"
        className="bg-white rounded-xl shadow-lg overflow-hidden"
        style={{
          width: "950px",
          minHeight: "1123px",
        }}
      >
        {/* HEADER */}

        <div className="border-b px-10 py-8 flex justify-between items-center">
          <div className="space-y-2">
            <Image
              src="/images/logo/logoNew.png"
              alt="Executive Corner"
              width={170}
              height={60}
              priority
            />
          </div>

          <div>
            <h1 className="text-5xl italic font-light">E-Receipt</h1>
          </div>
        </div>

        {/* PAYMENT */}

        <section className="border-b px-10 py-8">
          <h2 className="font-bold text-xl mb-5">Payment Details</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Info label="Order ID" value={order.id} />

              <Info label="Invoice ID" value={order.invoiceId ?? "-"} />

              <Info label="Created" value={formatDate(order.createdAt)} />

              {order.paidAt && (
                <Info label="Paid At" value={formatDate(order.paidAt)} />
              )}
            </div>

            <div className="space-y-3">
              <Info label="Payment Method" value={paymentMethod} />

              <div className="flex items-center gap-3">
                <span className="font-medium">Status</span>

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${status.color}`}
                >
                  {status.icon}

                  {order.status}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* BUYER */}

        <section className="border-b px-10 py-8 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-bold text-xl mb-5">Buyer Details</h2>

            <Info label="Name" value={buyer.name} />

            <Info label="Email" value={buyer.email} />
          </div>

          <div>
            <h2 className="font-bold text-xl mb-5">Seller Details</h2>

            <Info label="Company" value={order.event?.company?.name} />

            <Info
              label="Location"
              value={order.event?.company?.location ?? "-"}
            />
          </div>
        </section>

        {/* PARTICIPANTS */}

        <section className="border-b px-10 py-8">
          <h2 className="font-bold text-xl mb-5">Participant Data</h2>

          <div className="space-y-2">
            {order.ticket.map((ticket, index) => (
              <div
                key={ticket.id}
                className="flex justify-between border-b py-2"
              >
                <span>Participant {index + 1}</span>

                <span className="font-medium">{ticket.attendeeName}</span>
              </div>
            ))}
          </div>
        </section>

        {/* TABLE */}

        <section className="px-10 py-8">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3">No</th>

                <th className="border p-3">Event</th>

                <th className="border p-3">Qty</th>

                <th className="border p-3">Price</th>

                <th className="border p-3">Total</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border p-3 text-center">1</td>

                <td className="border p-3">{order.event.title}</td>

                <td className="border p-3 text-center">
                  {order.ticket.length}
                </td>

                <td className="border p-3 text-right">
                  Rp{" "}
                  {(order.amount / order.ticket.length).toLocaleString("id-ID")}
                </td>

                <td className="border p-3 text-right font-bold">
                  Rp {order.amount.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* TOTAL */}

          <div className="flex justify-end mt-8">
            <div className="w-80">
              <div className="flex justify-between py-2">
                <span>Total</span>

                <span className="font-bold text-lg">
                  Rp {order.amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <span className="w-36 text-gray-500">{label}</span>

      <span className="mr-2">:</span>

      <span className="font-medium break-all">{value}</span>
    </div>
  );
}
