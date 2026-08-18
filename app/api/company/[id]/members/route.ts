import { authOptions } from "@/lib/auth";
import { sendCompanyInviteEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notification-service";

import {
  CompanyRole,
} from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const companyId = Number(params.id);
  const body: { usernameOrEmail: string; role: string } = await req.json();

  const inviter = await prisma.companyUser.findFirst({
    where: {
      companyId,
      userId: Number(session.user.id),
      role: { in: ["OWNER", "ADMIN"] },
      status: "ACTIVE",
    },
  });

  if (!inviter) {
    return NextResponse.json({ message: "No Permission" }, { status: 403 });
  }

  const targetUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username: body.usernameOrEmail,
        },
        { email: body.usernameOrEmail },
      ],
    },
  });

  if (!targetUser) {
    return NextResponse.json({ message: "User Not Found" }, { status: 404 });
  }

  const existingActive = await prisma.companyUser.findFirst({
    where: { userId: targetUser.id, status: "ACTIVE" },
    include: { company: { select: { name: true } } },
  });

  if (existingActive) {
    return NextResponse.json(
      {
        message: `This user is already an active member of ${existingActive.company.name} and cannot be invited. `,
      },
      { status: 400 },
    );
  }

  const alreadyMember = await prisma.companyUser.findFirst({
    where: {
      companyId,
      userId: targetUser.id,
    },
  });

  // check member agar 1 user hanya bisa mempunya 1 company (tidak bisa double)
  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
  });

  if (alreadyMember) {
    if (alreadyMember.status === "DECLINED") {
      const updatedMember =
          await prisma.companyUser.update({
            where: {
              id: alreadyMember.id,
            },

            data: {
              status: "PENDING",

              role:
                body.role as CompanyRole,
            },
          });

        await createNotification({
          userId:
            targetUser.id,

          type:
            "COMPANY_INVITE",

          title:
            "Company Invitation",

          message:
            `You have been invited to join ${company?.name} as a ${body.role}.`,

          data: {
            companyUserId:
              updatedMember.id,

            companyId:
              company?.id,

            companyName:
              company?.name,

            role:
              body.role,
          },

          status:
            "PENDING",
        });

        return NextResponse.json({
          success: true,

          data: updatedMember,
        });
    }
    const textMessage =
      alreadyMember.status === "PENDING"
        ? "User has already been invited and is awaiting confirmation."
        : "User is already a member of this company.";

    return NextResponse.json({ message: textMessage }, { status: 400 });
  }

  const newMember = await prisma.companyUser.create({
    data: {
      userId: targetUser.id,
      companyId,
      role: body.role as CompanyRole,
      status: "PENDING",
    },
  });

  await createNotification({
      userId:
        targetUser.id,

      type:
        "COMPANY_INVITE",

      title:
        "Company Invitation",

      message:
        `You have been invited to join ${company?.name} as ${body.role}.`,

      data: {
        companyUserId:
          newMember.id,

        companyId:
          company?.id,

        companyName:
          company?.name,

        role:
          body.role,
      },

      status:
        "PENDING",
    });

  const inviterUser = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { name: true },
  });

  try {
    await sendCompanyInviteEmail({
      to: targetUser.email,
      inviteeName: targetUser.name,
      inviterName: inviterUser?.name ?? "Someone",
      companyName: company?.name ?? "a company",
      role: body.role,
      acceptUrl: `${process.env.NEXT_PUBLIC_BASE_URL}`,
    });
  } catch (err) {
    console.error("[sendCompanyInviteEmail] failed:", err);
  }
  return NextResponse.json({ success: true, data: newMember });
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const members = await prisma.companyUser.findMany({
    where: {
      companyId: Number(params.id),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          photo: true,
        },
      },
    },
  });

  return NextResponse.json({ data: members });
}
