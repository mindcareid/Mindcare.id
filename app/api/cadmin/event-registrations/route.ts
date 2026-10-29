import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/adminGuard";
import { PAGE_SIZE } from "@/lib/cadmin/eventRegistrations.shared";
import {
  describeAttendeeData,
  listPlatformEvents,
  loadAttendeeFields,
  loadRegistrationSummary,
  loadRegistrations,
  parseFilters,
} from "@/lib/cadmin/eventRegistrations";

/**
 * GET /api/cadmin/event-registrations
 *   ?eventId=1&status=PAID&search=budi&page=1
 *
 * Hanya pendaftar event platform MindCare. Satu baris = satu pendaftar/tiket.
 */
export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  try {
    const filters = parseFilters(new URL(req.url).searchParams);

    const [{ rows, total }, events, summary] = await Promise.all([
      loadRegistrations(filters),
      listPlatformEvents(),
      loadRegistrationSummary(filters),
    ]);

    // Label field untuk event yang muncul di halaman ini saja.
    const fieldMap = await loadAttendeeFields([
      ...new Set(rows.map((row) => row.eventId)),
    ]);

    return NextResponse.json({
      data: rows.map(({ attendeeData, ...row }) => ({
        ...row,
        customFields: describeAttendeeData(
          attendeeData,
          fieldMap.get(row.eventId),
        ),
      })),
      meta: {
        total,
        page: filters.page,
        pageSize: PAGE_SIZE,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      },
      summary,
      events,
    });
  } catch (error) {
    console.error("GET ADMIN EVENT REGISTRATIONS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch registrations" },
      { status: 500 },
    );
  }
}
