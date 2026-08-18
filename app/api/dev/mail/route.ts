import { NextResponse } from "next/server";

import { ticketTemplate } from "@/lib/mail/templates/ticket";

import { sampleTicket } from "../_data";

export async function GET() {
  return new NextResponse(
    ticketTemplate(sampleTicket),
    {
      headers: {
        "Content-Type": "text/html",
      },
    },
  );
}