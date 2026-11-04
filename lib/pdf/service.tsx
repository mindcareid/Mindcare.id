import { renderToBuffer } from "@react-pdf/renderer";

import {
  ProposalPdf,
  ProposalPdfProps,
} from "./templates/proposal";
import {
  TicketPdf,
  TicketPdfProps,
} from "./templates/ticket";
import {
  SponsorConfirmationPdf,
  SponsorConfirmationPdfProps,
} from "./templates/sponsor";

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

  static async generateProposal(
    data: ProposalPdfProps,
  ): Promise<Buffer> {
    return renderToBuffer(
      <ProposalPdf {...data} />,
    );
  }

  static async generateSponsorConfirmation(
    data: SponsorConfirmationPdfProps,
  ): Promise<Buffer> {
    return renderToBuffer(
      <SponsorConfirmationPdf {...data} />,
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