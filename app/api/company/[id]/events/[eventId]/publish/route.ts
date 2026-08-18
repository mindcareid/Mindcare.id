import { canManageEvent, getCompanyMember } from "@/lib/company-auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; eventId: string } },
) {
  const companyId = Number(params.id);
  const eventId = Number(params.eventId);

  if (isNaN(companyId) || isNaN(eventId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  //checing HANYA OWNER ATAU ADMIN YANG BISA PUBLISH/UNPUBLISH EVENT
  const member = await getCompanyMember(companyId);
  if (!member) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!canManageEvent(member.role)) {
    return NextResponse.json(
      { message: "Forbidden: Only OWNER or ADMIN can publish Events" },
      { status: 403 },
    );
  }

  try {
    const existing = await prisma.event.findFirst({
      where: { id: eventId, companyId, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ message: "Event Not Found" }, { status: 404 });
    }
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 },
      );
    }
    const { isPublished } = body as { isPublished: unknown };
    if (typeof isPublished !== "boolean") {
      return NextResponse.json(
        { message: "isPublished must be a boolean" },
        { status: 400 },
      );
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: { isPublished },
    });

    return NextResponse.json({
      message: `Event ${updated.isPublished ? "published" : "unpublished"} successfully`,
      data: { isPublished: updated.isPublished },
    });
  } catch (error) {
    console.error("[PATCH_PUBLISH_EVENT]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
