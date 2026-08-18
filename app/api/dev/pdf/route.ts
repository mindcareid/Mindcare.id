import { PdfService } from "@/lib/pdf";
import { sampleTicket } from "../_data";

export async function GET() {
    const pdf = await PdfService.generateTicket({
        eventTitle: sampleTicket.eventTitle,
        eventImage: sampleTicket.eventImage,
        qrCode: sampleTicket.qrCode,
        bookingCode: sampleTicket.bookingCode,
        attendeeName: sampleTicket.attendeeName,
        email: sampleTicket.to,
        company: sampleTicket.company,
        position: sampleTicket.position,
        date: sampleTicket.date,
        time: sampleTicket.time,
        venue: sampleTicket.venue,
        description: sampleTicket.description,
    });

    const bytes = Uint8Array.from(pdf);

    return new Response(bytes, {
        headers: {
            "Content-Type": "application/pdf",
        },
    });
}