import { NextResponse } from "next/server";

import {
  getEvents,
  getEventBySlug,
} from "@/lib/events/queries";

import { parseEventParams } from "@/lib/events/parser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    /* ==========================
       DETAIL
    ========================== */

    const slug = searchParams.get("slug");

    if (slug) {
      const event = await getEventBySlug(slug);

      if (!event) {
        return NextResponse.json(
          {
            success: false,
            message: "Event not found",
          },
          {
            status: 404,
          },
        );
      }

      return NextResponse.json({
        success: true,
        data: event,
      });
    }

    /* ==========================
       LIST
    ========================== */
    const params = parseEventParams(searchParams);
    const result = await getEvents(params);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("PUBLIC EVENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch events",
      },
      {
        status: 500,
      },
    );
  }
}