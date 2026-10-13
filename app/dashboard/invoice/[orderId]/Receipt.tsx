"use client";

import Image from "next/image";
import { CheckCircle2, Clock3, Printer, XCircle } from "lucide-react";

import { formatDateTime } from "@/lib/utils/FormatDate";
import DownloadPdf from "./DownloadPdf";
import type { OrderEvent } from "@/lib/orders";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

import type { Prisma } from "@prisma/client";

type XenditPayload = Prisma.JsonObject & {
  payment_method?: string;
  payment_channel?: string;
  bank_code?: string;
};

interface Props {
  order: OrderEvent;
}

const SELLER = {
  name: "MindCare.id",
  address:
    "Rukan Aries Niaga, Jl. Taman Aries No.1 Blok D1 2D, Meruya Utara, Kec. Kembangan, Jakarta Barat, DKI Jakarta 11620",
  email: "info@mindcare.id",
  phone: "+6221 5890 5593",
};

export default function Receipt({ order }: Props) {
  const buyer = order.user;

  const paymentLog = [...order.paymentLogs]
    .reverse()
    .find((log) => log.status === "PAID");

  const payload = paymentLog?.payload as XenditPayload | undefined;

  const paymentMethod = payload
    ? [payload.payment_method, payload.payment_channel ?? payload.bank_code]
        .filter(Boolean)
        .join(" - ")
    : order.amount === 0
      ? "Free"
      : "-";

  const statusBadge =
    order.status === "PAID"
      ? { className: "bg-accent/10 text-accent", Icon: CheckCircle2 }
      : order.status === "PENDING"
        ? { className: "bg-primary/10 text-primary", Icon: Clock3 }
        : { className: "bg-destructive/10 text-destructive", Icon: XCircle };

  const StatusIcon = statusBadge.Icon;
  const unitPrice =
    order.tickets.length > 0
      ? order.amount / order.tickets.length
      : order.amount;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-end gap-2 print:hidden">
        <DownloadPdf orderId={order.id} />

        <button
          type="button"
          onClick={() => window.print()}
          className={buttonStyles({
            variant: "outline",
            className: "min-h-11",
          })}
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print
        </button>
      </div>

      <div
        id="receipt"
        className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
      >
        {/* HEADER */}
        <div className="flex flex-col gap-4 border-b border-border px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Image
            src="/images/logo/logoNew.png"
            alt="MindCare.id"
            width={150}
            height={48}
            priority
            className="h-10 w-auto self-start object-contain"
          />

          <div className="sm:text-right">
            <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
              Payment receipt
            </h1>
            <p className="mt-1 text-sm uppercase text-primary">
              Order #{order.id}
            </p>
          </div>
        </div>

        {/* PAYMENT */}
        <section className="border-b border-border px-5 py-6 sm:px-8 sm:py-8">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Payment details
          </h2>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <Info label="Invoice ID" value={order.invoiceId ?? "-"} />
              <Info label="Created" value={formatDateTime(order.createdAt)} />
              {order.paidAt && (
                <Info label="Paid at" value={formatDateTime(order.paidAt)} />
              )}
            </div>

            <div className="space-y-3">
              <Info label="Method" value={paymentMethod} />

              <div className="flex flex-wrap items-center gap-3">
                <span className="w-28 shrink-0 text-muted-foreground sm:w-36">
                  Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${statusBadge.className}`}
                >
                  <StatusIcon className="h-4 w-4" aria-hidden="true" />
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* BUYER + SELLER */}
        <section className="grid gap-6 border-b border-border px-5 py-6 sm:grid-cols-2 sm:gap-10 sm:px-8 sm:py-8">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Buyer details
            </h2>
            <div className="mt-4 space-y-3">
              <Info label="Name" value={buyer.name} />
              <Info label="Email" value={buyer.email} />
            </div>
          </div>

          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Seller details
            </h2>
            <div className="mt-4 space-y-3">
              <Info label="Company" value={SELLER.name} />
              <Info label="Address" value={SELLER.address} />
              <Info label="Email" value={SELLER.email} />
              <Info label="Phone" value={SELLER.phone} />
            </div>
          </div>
        </section>

        {/* PARTICIPANTS */}
        <section className="border-b border-border px-5 py-6 sm:px-8 sm:py-8">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Participants
          </h2>

          <ul className="mt-4 space-y-2.5">
            {order.tickets.map((ticket, index) => (
              <li
                key={ticket.id}
                className="flex items-start gap-3 rounded-lg border border-border px-4 py-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-lavender-100 text-xs font-semibold text-secondary">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {ticket.attendeeName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {ticket.attendeeEmail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* LINE ITEMS */}
        <section className="px-5 py-6 sm:px-8 sm:py-8">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Order summary
          </h2>

          {/* table on sm+ */}
          <table className="mt-4 hidden w-full border border-border text-sm sm:table">
            <thead className="bg-muted">
              <tr>
                <th className="border border-border p-3 text-left font-medium">
                  No
                </th>
                <th className="border border-border p-3 text-left font-medium">
                  Event
                </th>
                <th className="border border-border p-3 text-center font-medium">
                  Qty
                </th>
                <th className="border border-border p-3 text-right font-medium">
                  Price
                </th>
                <th className="border border-border p-3 text-right font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-3 text-center">1</td>
                <td className="border border-border p-3">
                  {order.event.title}
                </td>
                <td className="border border-border p-3 text-center">
                  {order.tickets.length}
                </td>
                <td className="border border-border p-3 text-right">
                  Rp {unitPrice.toLocaleString("id-ID")}
                </td>
                <td className="border border-border p-3 text-right font-semibold">
                  Rp {order.amount.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* stacked on mobile */}
          <dl className="mt-4 space-y-2 text-sm sm:hidden">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Event</dt>
              <dd className="text-right font-medium text-foreground">
                {order.event.title}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Qty</dt>
              <dd className="font-medium text-foreground">
                {order.tickets.length}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Price</dt>
              <dd className="font-medium text-foreground">
                Rp {unitPrice.toLocaleString("id-ID")}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <div className="flex w-full justify-between gap-4 sm:w-80">
              <span className="text-muted-foreground">Total</span>
              <span className="font-heading text-lg font-semibold text-foreground">
                Rp {order.amount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-28 shrink-0 text-muted-foreground sm:w-36">
        {label}
      </span>
      <span className="font-medium wrap-break-word text-foreground">
        {value}
      </span>
    </div>
  );
}
