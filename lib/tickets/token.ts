import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  const value =
    process.env.TICKET_LINK_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";

  if (!value) {
    throw new Error(
      "TICKET_LINK_SECRET or NEXTAUTH_SECRET must be set to sign ticket links.",
    );
  }

  return value;
}

function sign(ticketId: string): string {
  return createHmac("sha256", secret()).update(ticketId).digest("base64url");
}

export function createTicketToken(ticketId: string): string {
  return `${ticketId}.${sign(ticketId)}`;
}

export function verifyTicketToken(token: string): string | null {
  const separator = token.lastIndexOf(".");

  if (separator <= 0) {
    return null;
  }

  const ticketId = token.slice(0, separator);
  const provided = token.slice(separator + 1);
  const expected = sign(ticketId);

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer) ? ticketId : null;
}
