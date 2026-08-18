import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notification-service";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: { companyUserId: string };
  },
) {
  try {
    /**
     * =====================================================
     * AUTHENTICATION
     * =====================================================
     */

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const userId = Number(session.user.id);
    const companyUserId = Number(
      params.companyUserId,
    );

    if (!Number.isInteger(companyUserId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid companyUserId",
        },
        { status: 400 },
      );
    }

    /**
     * =====================================================
     * REQUEST
     * =====================================================
     */

    const body: {
      action: "ACCEPT" | "DECLINE";
      notificationId: number;
    } = await req.json();

    const {
      action,
      notificationId,
    } = body;

    if (
      action !== "ACCEPT" &&
      action !== "DECLINE"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Action must be ACCEPT or DECLINE",
        },
        { status: 400 },
      );
    }

    /**
     * =====================================================
     * GET COMPANY INVITATION
     * =====================================================
     */

    const companyUser =
      await prisma.companyUser.findUnique({
        where: {
          id: companyUserId,
        },

        include: {
          company: true,

          user: {
            select: {
              name: true,
            },
          },
        },
      });

    if (!companyUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Company invitation not found",
        },
        { status: 404 },
      );
    }

    /**
     * Pastikan invitation memang milik
     * user yang sedang login.
     */
    if (companyUser.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    /**
     * =====================================================
     * ACCEPT VALIDATION
     * =====================================================
     */

    if (action === "ACCEPT") {
      const existingActive =
        await prisma.companyUser.findFirst({
          where: {
            userId,

            status: "ACTIVE",

            id: {
              not: companyUser.id,
            },
          },

          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        });

      if (existingActive) {
        return NextResponse.json(
          {
            success: false,
            message: `You are already an active member of ${existingActive.company.name}. You must leave that company first before joining another.`,
          },
          { status: 400 },
        );
      }
    }

    /**
     * =====================================================
     * UPDATE COMPANY USER STATUS
     * =====================================================
     */

    const newStatus =
      action === "ACCEPT"
        ? "ACTIVE"
        : "DECLINED";

    await prisma.companyUser.update({
      where: {
        id: companyUser.id,
      },

      data: {
        status: newStatus,
      },
    });

    /**
     * =====================================================
     * UPDATE ORIGINAL INVITATION NOTIFICATION
     * =====================================================
     */

    const updatedNotification =
      await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          isRead: true,
          status: newStatus,
        },
      });

    console.log(
      "🔔 Original notification updated:",
      {
        id: updatedNotification.id,
        status: updatedNotification.status,
        isRead: updatedNotification.isRead,
      },
    );
    /**
     * =====================================================
     * FIND COMPANY OWNER
     * =====================================================
     */

    const owner =
      await prisma.companyUser.findFirst({
        where: {
          companyId: companyUser.companyId,

          role: "OWNER",

          status: "ACTIVE",
        },
      });

    /**
     * =====================================================
     * NOTIFY COMPANY OWNER
     * =====================================================
     */

    if (owner) {
      const notificationType =
        action === "ACCEPT"
          ? "COMPANY_ACCEPTED"
          : "COMPANY_DECLINED";

      const notificationTitle =
        action === "ACCEPT"
          ? "Invitation Accepted"
          : "Invitation Declined";

      const notificationMessage =
        action === "ACCEPT"
          ? `${companyUser.user.name} has accepted the invitation to join ${companyUser.company.name}.`
          : `${companyUser.user.name} has declined the invitation to join ${companyUser.company.name}.`;

      await createNotification({
        userId: owner.userId,

        type: notificationType,

        title: notificationTitle,

        message: notificationMessage,

        data: {
          companyUserId: companyUser.id,

          companyId: companyUser.companyId,

          action,
        },

        status: newStatus,
      });
    }

    /**
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    return NextResponse.json({
      success: true,

      status: newStatus,
    });
  } catch (error) {
    console.error(
      "[Company Invitation PATCH]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to process invitation",
      },
      { status: 500 },
    );
  }
}

