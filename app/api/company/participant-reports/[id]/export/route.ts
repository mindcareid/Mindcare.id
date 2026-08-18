import { NextRequest, NextResponse } from "next/server";
import { requireCompanyEventAccess } from "@/lib/participants/guard";
import { getAllEventParticipantForExport } from "@/lib/participants/export-queries";
import { participantWorkBook } from "@/lib/participants/export";

const VALID = ["PENDING", "PAID", "EXPIRED", "CANCELED"] as const;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const eventId = Number(params.id);
  if (isNaN(eventId)) {
    return NextResponse.json({ message: "Invalid EventID" }, { status: 400 });
  }

  const access = await requireCompanyEventAccess(eventId);

  if (!access.ok) {
    return NextResponse.json(
      { message: access.message },
      { status: access.status },
    );
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const status = VALID.includes(statusParam as never)
    ? (statusParam as (typeof VALID)[number])
    : undefined;

  const { event, fields, data } = await getAllEventParticipantForExport({
    eventId,
    status,
  });

  if (!event) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  const buffer = await participantWorkBook({ rows: data, fields });
  const safeTitle = event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="peserta-${safeTitle}.xlsx"`,
    },
  });
}
