"use client";

import { useState } from "react";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { FiUser, FiMail, FiPhone, FiCalendar } from "react-icons/fi";
import { Pagination } from "../components/Pagination";
import type {
  ParticipantReportMeta,
  ParticipantReportRow,
} from "@/lib/participants/type";
import { formatCurrency } from "@/lib/utils/FormatCurrency";
import { formatDate } from "@/lib/utils/FormatDate";

type FieldDef = {
  id: string;
  key: string;
  label: string;
};

type Props = {
  rows: ParticipantReportRow[];
  fields: FieldDef[];
  meta: ParticipantReportMeta;
  currentPage: number;
};

const STATUS_STYLES: Record<
  ParticipantReportRow["status"],
  { label: string; className: string }
> = {
  PAID: {
    label: "Paid",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  PENDING: {
    label: "Waiting Payment",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
  CANCELED: {
    label: "Canceled",
    className: "bg-red-100 text-red-600 border-red-200",
  },
};

function getAnswerValue(answers: Record<string, unknown>, key: string): string {
  const value = answers[key];
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  return String(value);
}
function OrderRow({
  row,
  fields,
}: {
  row: ParticipantReportRow;
  fields: FieldDef[];
}) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_STYLES[row.status];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-sm">
      {/* Ringkasan — selalu tampil */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-5 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 truncate">
              {row.buyer.name}
            </p>
            <span
              className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <FiMail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{row.buyer.email}</span>
            </span>

            {row.buyer.phone && (
              <span className="flex items-center gap-1.5">
                <FiPhone className="w-3.5 h-3.5 shrink-0" />
                {row.buyer.phone}
              </span>
            )}

            <span className="flex items-center gap-1.5">
              <FiCalendar className="w-3.5 h-3.5 shrink-0" />
              {formatDate(row.transactionDate)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
          <div className="text-left sm:text-right">
            <p className="text-xs text-gray-400">{row.quantity} Participant</p>
            <p className="font-semibold text-gray-900">
              {row.isFree ? (
                <span className="text-green-600">Free</span>
              ) : (
                formatCurrency(row.totalPayment)
              )}
            </p>
          </div>

          <span className="shrink-0 text-gray-400">
            {expanded ? (
              <MdOutlineKeyboardArrowUp className="w-5 h-5" />
            ) : (
              <MdOutlineKeyboardArrowDown className="w-5 h-5" />
            )}
          </span>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 space-y-3">
          <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
            Order ID: {row.orderId}
          </p>

          {row.attendees.map((attendee) => (
            <div
              key={attendee.ticketId}
              className="rounded-xl border border-gray-300 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <FiUser className="w-4 h-4 text-gray-400 shrink-0" />
                  <p className="font-medium text-gray-900">{attendee.name}</p>
                </div>

                <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                  {attendee.code}
                </span>
              </div>

              <div className="mt-2 flex flex-col gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-2 break-all">
                  <FiMail className="h-3.5 w-3.5 shrink-0" />
                  <span>{attendee.email}</span>
                </div>
                {attendee.phone && (
                  <div className="flex items-center gap-2">
                    <FiPhone className="h-3.5 w-3.5 shrink-0" />
                    <span>{attendee.phone}</span>
                  </div>
                )}
              </div>
              {fields.length > 0 && (
                <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2  border-t border-gray-100 pt-2">
                  {fields.map((field) => (
                    <div key={field.id}>
                      <dt className="text-xs font-semibold text-gray-900">
                        {field.label}
                      </dt>
                      <dd className="text-sm text-gray-500">
                        {getAnswerValue(attendee.answers, field.key)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default function ParticipantTable({
  rows,
  fields,
  meta,
  currentPage,
}: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-20 text-center">
        <p className="text-gray-400 text-sm">
          No participants have registered for this event yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {rows.map((row) => (
          <OrderRow key={row.orderId} row={row} fields={fields} />
        ))}
      </div>

      {meta.totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={meta.totalPages} />
      )}
    </div>
  );
}
