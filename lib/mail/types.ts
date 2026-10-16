export interface SendTicketEmailParams {
  to: string;
  eventTitle: string;
  qrCode: string;
  attendeeName: string;
  bookingCode: string;
  date: string;
  time: string;
  venue: string;
  eventImage: string;
  description?: string;
  company?: string;
  position?: string;
}

export interface SendContactNotificationParams {
  name: string;
  email: string;
  phoneNumber?: string;
  subject: string;
  message: string;
}
export interface SendResetPasswordEmailParams {
  to: string;
  name: string;
  resetUrl: string;
}
export interface SendVerificationEmailParams {
  to: string;
  name: string;
  verifyUrl: string;
}

export type ListingKind = "professional" | "care-centre" | "solution";

export type ListingReviewState = "under_review" | "approved" | "rejected";

export interface SendListingReviewEmailParams {
  to: string;
  name: string;
  listingName: string;
  kind: ListingKind;
  state: ListingReviewState;
  reason?: string;
  dashboardUrl?: string;
}
