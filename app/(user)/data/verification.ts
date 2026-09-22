export type VerificationReview =
  | "none"
  | "pending"
  | "approved"
  | "rejected"
  | "revoked";

export type VerificationSource = "submission" | "registry";
export type VerificationSubject = "person" | "facility";

export interface Verification {
  review: VerificationReview;
  checkedOn: string | null;
  validUntil: string | null;
  source: VerificationSource | null;
}

export type VerificationState =
  | "unverified"
  | "pending"
  | "verified"
  | "expired"
  | "rejected"
  | "revoked";

export const VERIFICATION_TIME_ZONE = "Asia/Jakarta";
export const VERIFICATION_POLICY_PATH = "/help/verification-policy";
export const VERIFICATION_LABELS: Record<VerificationSubject, string> = {
  person: "Licence checked",
  facility: "Licence & permit checked",
};

function todayIn(now: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now));

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

export function verificationStateOf(
  verification: Verification,
  now: string,
): VerificationState {
  switch (verification.review) {
    case "none":
      return "unverified";
    case "pending":
      return "pending";
    case "rejected":
      return "rejected";
    case "revoked":
      return "revoked";
    case "approved": {
      if (!verification.validUntil) return "expired";
      return todayIn(now, VERIFICATION_TIME_ZONE) <= verification.validUntil
        ? "verified"
        : "expired";
    }
  }
}

export function verificationLabelOf(
  verification: Verification,
  now: string,
  subject: VerificationSubject,
) {
  return verificationStateOf(verification, now) === "verified"
    ? VERIFICATION_LABELS[subject]
    : null;
}

const checkedOnFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

export function formatCheckedOn(verification: Verification) {
  if (!verification.checkedOn) return null;
  return checkedOnFormatter.format(new Date(verification.checkedOn));
}
