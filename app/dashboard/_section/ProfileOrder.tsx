"use client";

import Image from "next/image";
import Link from "next/link";
import { FaRegCreditCard } from "react-icons/fa6";
import { FiExternalLink } from "react-icons/fi";

type Order = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  ticketCount: number;
  event: {
    title: string;
  };
};

export default function ProfileUserOrder({ orders }: { orders: Order[] }) {
  const hasOrders = orders.length > 0;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-300 flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex flex-row justify-between items-center gap-2">
        <div className="flex flex-col items-start gap-1">
          <div className="flex flex-row items-center gap-1">
            <FaRegCreditCard className="w-5 h-5 text-gray-600" />
            <p className="text-xl font-semibold text-gray-500">Orders</p>
          </div>

          <p className="text-base font-semibold text-gray-500">
            {orders.length} latest purchases
          </p>
        </div>

        <Link
          href="/dashboard/orders"
          className="flex flex-row items-center gap-1"
        >
          <FiExternalLink className="w-5 h-5 text-gray-600 hover:text-blue-500" />
        </Link>
      </div>

      {/* EMPTY STATE */}
      {!hasOrders && (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-6">
          <Image
            src="/images/logo/empty.webp"
            alt="Empty"
            width={200}
            height={100}
          />
          <p className="text-base text-gray-500">
            There are no orders at the moment.
          </p>
        </div>
      )}

      {/* ORDER LIST */}
      {hasOrders && (
        <div className="flex flex-col gap-3">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex justify-between border-b pb-2">
              <p className="text-sm font-medium">{order.event.title}</p>
              <p className="text-sm text-gray-500">
                {order.amount === 0
                  ? "Free"
                  : `Rp ${order.amount.toLocaleString("id-ID")}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
