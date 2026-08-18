import { authOptions } from "@/lib/auth";
import {
  sendCompanyApprovedEmail,
  sendCompanyRejectedEmail,
} from "@/lib/email";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import z from "zod";

async function checkSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { role: true },
  });

  if (!user || !["SUPERADMIN", "ADMIN"].includes(user.role)) return null;
  return user;
}

const PatchCompanySchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await checkSuperAdmin();

  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const body: unknown = await req.json();
  const parsed = PatchCompanySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid action!" }, { status: 400 });
  }

  const { action } = parsed.data;
  const companyId = Number(params.id);

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      users: {
        where: { role: "OWNER" },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!company) {
    return NextResponse.json(
      { message: "Company not found!" },
      { status: 404 },
    );
  }

  const owner = company.users.find((u) => u.role === "OWNER");
  if (!owner) {
    return NextResponse.json({ message: "Owner not found!" }, { status: 400 });
  }

  if (action === "APPROVE") {
    await prisma.$transaction([
      prisma.companyUser.update({
        where: { id: owner.id },
        data: { status: "ACTIVE" },
      }),
      prisma.company.update({
        where: { id: companyId },
        data: { isActive: true },
      }),
    ]);
    revalidatePath("/partners");

    await prisma.notification.create({
      data: {
        userId: owner.user.id,
        type: "COMPANY_ACCEPTED",
        title: "Company Approved!",
        message: `Your company "${company.name}" has been approved. You can now start publishing events.`,
      },
    });

    try {
      await sendCompanyApprovedEmail({
        to: owner.user.email,
        ownerName: owner.user.name,
        companyName: company.name,
        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/company/dashboard`,
      });
    } catch (err) {
      console.error("[send Company Approved Email] failed:", err);
    }
  } else {
    await prisma.$transaction([
      prisma.companyUser.update({
        where: { id: owner.id },
        data: { status: "DECLINED" },
      }),
      prisma.company.update({
        where: { id: companyId },
        data: {
          isActive: false,
          deletedAt: new Date(),
          slug: `${company.slug}-rejected-${Date.now()}`,
        },
      }),
      prisma.event.updateMany({
        where: { companyId, isPublished: true, deletedAt: null },
        data: { isPublished: false },
      }),
    ]);
    revalidatePath("/partners");

    await prisma.notification.create({
      data: {
        userId: owner.user.id,
        type: "COMPANY_DECLINED",
        title: "Company Rejected",
        message: `Your company "${company.name}" was not approved. Please contact support for more information.`,
      },
    });
    try {
      await sendCompanyRejectedEmail({
        to: owner.user.email,
        ownerName: owner.user.name,
        companyName: company.name,
      });
    } catch (err) {
      console.error("[send Company Rejected email] failed:", err);
    }
  }

  return NextResponse.json({
    success: true,
    message: action === "APPROVE" ? "Company approved" : "Company rejected",
  });
}
