import { authOptions } from "@/lib/auth";
import { getOrdersByUserId } from "@/lib/services/order.service";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { OrderList } from "../components/orders";

export default async function OrderPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) redirect("/auth/login");

  const orders = await getOrdersByUserId(Number(session.user.id));

  return <OrderList orders={orders} />;
}
