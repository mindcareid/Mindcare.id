import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import MyTicketList from "./MyTicketList";

export default async function MyTicketPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/auth/login");

  const orderId = searchParams.orderId;

  const tickets = await prisma.ticket.findMany({
    where: {
      order: {
        userId: Number(session.user.id),
        status: "PAID",
        ...(orderId && { id: orderId }),
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          status: true,
          event: {
            select: {
              title: true,
              startDate: true,
              location: true,
            },
          },
        },
      },
    },
  });

  return <MyTicketList tickets={tickets} />;
}
