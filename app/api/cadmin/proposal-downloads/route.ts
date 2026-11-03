import { NextResponse } from "next/server";

import { getAdminUser } from "@/lib/adminGuard";
import { PAGE_SIZE, parseFilters } from "@/lib/cadmin/proposalDownloads.shared";
import {
  listPlatformEvents,
  loadDownloads,
} from "@/lib/cadmin/proposalDownloads";

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  try {
    const filters = parseFilters(new URL(req.url).searchParams);

    const [{ rows, total }, events] = await Promise.all([
      loadDownloads(filters),
      listPlatformEvents(),
    ]);

    return NextResponse.json({
      data: rows,
      meta: {
        total,
        page: filters.page,
        pageSize: PAGE_SIZE,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      },
      events,
    });
  } catch (error) {
    console.error("GET ADMIN PROPOSAL DOWNLOADS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch proposal downloads" },
      { status: 500 },
    );
  }
}
