import { NextResponse } from "next/server";

import { getAdminUser } from "@/lib/adminGuard";
import { SPONSOR_PAGE_SIZE, parseSponsorFilters } from "@/lib/sponsors/shared";
import {
  listPlatformEventsForFilter,
  loadSponsorApplications,
  loadSponsorSummary,
} from "@/lib/sponsors/queries";

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  try {
    const filters = parseSponsorFilters(new URL(req.url).searchParams);

    const [{ rows, total }, summary, events] = await Promise.all([
      loadSponsorApplications(filters),
      loadSponsorSummary(filters),
      listPlatformEventsForFilter(),
    ]);

    return NextResponse.json({
      data: rows,
      meta: {
        total,
        page: filters.page,
        pageSize: SPONSOR_PAGE_SIZE,
        totalPages: Math.max(1, Math.ceil(total / SPONSOR_PAGE_SIZE)),
      },
      summary,
      events,
    });
  } catch (error) {
    console.error("GET ADMIN SPONSOR APPLICATIONS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch sponsor applications" },
      { status: 500 },
    );
  }
}
