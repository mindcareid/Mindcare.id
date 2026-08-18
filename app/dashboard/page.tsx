"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import ProfileUserHeader from "./_section/ProfileHeader";
import ProfileUserOrder from "./_section/ProfileOrder";

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

export default function DashboardUserPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    }

    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-24 bg-gray-200 rounded-xl"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-10">
          <div className="h-40 bg-gray-200 rounded-xl"></div>
          <div className="h-40 bg-gray-200 rounded-xl"></div>
          <div className="h-40 bg-gray-200 rounded-xl"></div>
          <div className="h-40 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return <p>Unauthorized</p>;
  }

  return (
    <main>
      <ProfileUserHeader user={session.user} />

      <div className="grid grid-cols-1 md:grid-cols-2 mx-4 my-4 gap-2">
        <ProfileUserOrder orders={orders} />
      </div>
    </main>
  );
}
