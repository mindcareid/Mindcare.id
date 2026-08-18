import { renderToBuffer } from "@react-pdf/renderer";

import {
  TicketPdf,
  TicketPdfProps,
} from "./templates/ticket";

// nanti
// import { InvoicePdf, InvoicePdfProps } from "./templates/invoice";
// import { BadgePdf, BadgePdfProps } from "./templates/badge";

export class PdfService {
  static async generateTicket(
    data: TicketPdfProps,
  ): Promise<Buffer> {
    return renderToBuffer(
      <TicketPdf {...data} />,
    );
  }

  /*
  static async generateInvoice(
    data: InvoicePdfProps,
  ): Promise<Buffer> {
    return renderToBuffer(
      <InvoicePdf {...data} />,
    );
  }

  static async generateBadge(
    data: BadgePdfProps,
  ): Promise<Buffer> {
    return renderToBuffer(
      <BadgePdf {...data} />,
    );
  }
  */
}