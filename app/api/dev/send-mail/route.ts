import { NextResponse } from "next/server";

import { sendTicketEmail } from "@/lib/mail";

import { sampleTicket } from "../_data";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  await sendTicketEmail(sampleTicket);
  return NextResponse.json({
    success: true,
    message: "Email sent successfully.",
  });
}
