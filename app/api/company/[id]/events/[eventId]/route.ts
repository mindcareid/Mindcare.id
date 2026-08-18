import {
  canManageEvent,
  getAllowedUpdateFields,
  getCompanyMember,
} from "@/lib/company-auth";
import prisma from "@/lib/prisma";
import { UpdateEventSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { toUtc } from "@/lib/date";

export async function GET(
  req: Request,
  { params }: { params: { id: string; eventId: string } },
) {
  const companyId = Number(params.id);
  const eventId = Number(params.eventId);

  if (isNaN(companyId) || isNaN(eventId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const member = await getCompanyMember(companyId);
  if (!member) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const event = await prisma.event.findFirst({
      where: { id: eventId, companyId, deletedAt: null },
      include: { category: true, attendeeFields: true },
    });

    if (!event) {
      return NextResponse.json({ message: "Event Not Found" }, { status: 404 });
    }

    return NextResponse.json({ data: event });
  } catch (error) {
    console.error("[GET_EVENT]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; eventId: string } },
) {
  const companyId = Number(params.id);
  const eventId = Number(params.eventId);

  if (isNaN(companyId) || isNaN(eventId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const member = await getCompanyMember(companyId);
  if (!member) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.event.findFirst({
      where: { id: eventId, companyId, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ message: "Event Not Found" }, { status: 404 });
    }

    const allowedFields = getAllowedUpdateFields(member.role);
    if (Array.isArray(allowedFields) && allowedFields.length === 0) {
      return NextResponse.json(
        { message: "Forbidden: Your Role Cannot Edit Events" },
        { status: 403 },
      );
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
    const filteredBody =
      allowedFields === null
        ? body
        : Object.fromEntries(
          allowedFields
            .filter((f) => (body as Record<string, unknown>)[f] !== undefined)
            .map((f) => [f, (body as Record<string, unknown>)[f]]),
        );

    const parsed = UpdateEventSchema.safeParse(filteredBody);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation Failed", errors: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const validateData = parsed.data;
    const dataToUpdate: Record<string, unknown> = {};

    const {
      industryIds,
      timeZone,
      ...restData
    } = validateData as typeof validateData & {
      industryIds?: number[];
      timeZone?: string;
    };

    if (allowedFields === null) {
      for (const key in restData) {
        const value = restData[key as keyof typeof restData];
        if (value !== undefined) {
          if (key === "startDate") {
            dataToUpdate.startDate = toUtc(
              value as string,
              timeZone ?? existing.timeZone,
            );
          } else if (key === "endDate") {
            dataToUpdate.endDate = toUtc(
              value as string,
              timeZone ?? existing.timeZone,
            );
          } else {
            dataToUpdate[key] = value;
          }
        }
      }
    } else {
      for (const key of allowedFields) {
        if (key === "industryIds") continue;
        const value = validateData[key as keyof typeof validateData];
        if (value !== undefined) {
          if (key === "startDate") {
            dataToUpdate.startDate = toUtc(
              value as string,
              timeZone ?? existing.timeZone,
            );
          } else if (key === "endDate") {
            dataToUpdate.endDate = toUtc(
              value as string,
              timeZone ?? existing.timeZone,
            );
          } else {
            dataToUpdate[key] = value;
          }
        }
      }
    }

    if (timeZone !== undefined) {
      dataToUpdate.timeZone = timeZone;
    }

    if (Object.keys(dataToUpdate).length === 0 && industryIds === undefined) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 },
      );
    }
    const isMovingToExternal =
      existing.externalUrl === null &&
      typeof dataToUpdate.externalUrl === "string";

    if (isMovingToExternal) {
      const blockingOrders = await prisma.order.count({
        where: {
          eventId,
          amount: { gt: 0 },
          status: { in: ["PAID", "PENDING"] },
        },
      });

      if (blockingOrders > 0) {
        return NextResponse.json(
          {
            message: `This event has ${blockingOrders} active paid order${
              blockingOrders > 1 ? "s" : ""
            }. Settle or refund them before moving registration to an external site — please contact support.`,
            activeOrders: blockingOrders,
          },
          { status: 409 },
        );
      }
    }

    await prisma.event.update({
      where: { id: eventId },
      data: {
        ...dataToUpdate,
        ...(industryIds !== undefined && {
          industries: {
            deleteMany: {},
            create: industryIds.map((industryId) => ({ industryId })),
          },
        }),
      },
    });

    return NextResponse.json({ message: "Event Updated Successfully!" });
  } catch (error) {
    console.error("[PATCH_EVENT]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; eventId: string } },
) {
  const companyId = Number(params.id);
  const eventId = Number(params.eventId);

  if (isNaN(companyId) || isNaN(eventId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const member = await getCompanyMember(companyId);
  if (!member) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!canManageEvent(member.role)) {
    return NextResponse.json(
      { message: "Forbidden: Only OWNER or ADMIN can delete events" },
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

    await prisma.event.update({
      where: { id: eventId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Event Deleted Successfully!" });
  } catch (error) {
    console.error("[DELETE_EVENT]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
