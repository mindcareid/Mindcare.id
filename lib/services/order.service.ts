import { prisma } from "@/lib/prisma";

export async function getOrdersByUserId(userId: number) {
  return prisma.order.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      event: {
        select: {
          title: true,
          startDate: true,
          location: true,
        },
      },
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });
}

export async function getOrderByUser(
  orderId: string,
  userId: number
) {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
       event: {
        include: {
          company: true,
        },
      },
            _count: {
        select: {
          tickets: true,
        },
      },
      user: true,
      tickets: true,
      paymentLogs: true,
    },
  });
}
