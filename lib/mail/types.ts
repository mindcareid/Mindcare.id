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

export interface SendCompanyInviteEmailParams {
  to: string;
  inviteeName: string;
  inviterName: string;
  companyName: string;
  role: string;
  acceptUrl: string;
}

export interface SendCompanySubmittedEmailParams {
  to: string;
  ownerName: string;
  companyName: string;
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

export type CompanyStatus = "approved" | "rejected";

export interface SendCompanyDecisionEmailParams {
  to: string;
  ownerName: string;
  companyName: string;
  dashboardUrl?: string;
}

export type SendCompanyStatusEmailParams = {
  to: string;
  ownerName: string;
  companyName: string;
  dashboardUrl?: string;
  status: CompanyStatus;
};