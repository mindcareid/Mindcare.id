import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

import { getOrderByUser } from "@/lib/services/order.service";
import Receipt from "./Receipt";
import "./receipt.css";

interface Props {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function InvoicePage({
  params,
}: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { orderId } = await params;

  if (!orderId) {
    notFound();
  }

  const order = await getOrderByUser(
    orderId,
    Number(session.user.id)
  );

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <Receipt order={order} />
      </div>
    </main>
  );
}