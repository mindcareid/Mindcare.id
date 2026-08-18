import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; memberId: string } },
) {
  try {

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const companyId = Number(params.id);
    const memberId = Number(params.memberId);

    //auth guard: selain OWNER/ADMIN tidak bisa ngehit api member company
    const requester = await prisma.companyUser.findFirst({
      where: {
        companyId,
        userId: Number(session.user.id),
        role: { in: ["OWNER", "ADMIN"] },
        status: "ACTIVE",
      },
    });

    if (!requester) {
      return NextResponse.json({ message: "No Permission" }, { status: 403 });
    }

    const targetMember = await prisma.companyUser.findFirst({
      where: { id: memberId, companyId },
    });

    if (!targetMember) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 },
      );
    }

    if (targetMember.role === "OWNER") {
      return NextResponse.json(
        { message: "Owner tidak dapat dihapus" },
        { status: 403 },
      );
    }

    if (targetMember.status === "DECLINED") {
      await prisma.companyUser.delete({
        where: {
          id: memberId,
        },
      });
      return NextResponse.json({ success: true });
    }

    await prisma.companyUser.delete({ where: { id: memberId } });

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    await prisma.notification.create({
      data: {
        userId: targetMember.userId,
        type: "GENERAL",
        title: "Removed from Company",
        message: `You have been removed as a member of ${company?.name}.`,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE MEMBER ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
