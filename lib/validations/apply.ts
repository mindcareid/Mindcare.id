import { z } from "zod";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validUntilSchema(label: string) {
  return z
    .string()
    .regex(DATE_PATTERN, "Pick a date (YYYY-MM-DD)")
    .refine((val) => !Number.isNaN(Date.parse(val)), "That date does not exist")
    .refine(
      (val) => Date.parse(`${val}T23:59:59Z`) > Date.now(),
      `${label} must still be valid — check the expiry date on the document`,
    );
}

export const PROFESSION_OPTIONS = [
  "Psikolog",
  "Psikiater",
  "Konselor",
] as const;

export const CENTRE_KIND_OPTIONS = [
  "Klinik",
  "Rumah Sakit",
  "Puskesmas",
  "Pusat Konseling",
] as const;

export const CENTRE_TIME_ZONE_OPTIONS = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
] as const;

const OPENS_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const CLOSES_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$|^24:00$/;

export const openingHourSchema = z
  .object({
    day: z.number().int().min(1).max(7),
    opens: z.string().regex(OPENS_PATTERN).nullable(),
    closes: z.string().regex(CLOSES_PATTERN).nullable(),
  })
  .refine(
    (hour) => (hour.opens === null) === (hour.closes === null),
    "Fill both open and close times, or leave both empty for a closed day",
  )
  .refine(
    (hour) =>
      hour.opens === null || hour.closes === null || hour.opens < hour.closes,
    "Close time must be after open time",
  );

export const openingHoursSchema = z
  .array(openingHourSchema)
  .length(7, "Opening hours must cover all seven days")
  .refine((hours) => {
    const days = hours.map((h) => h.day).sort((a, b) => a - b);
    return days.join(",") === "1,2,3,4,5,6,7";
  }, "Opening hours must cover Monday to Sunday exactly once");

export const professionalServiceSchema = z.object({
  name: z
    .string()
    .min(3, "Service name must be at least 3 characters")
    .max(100, "Service name cannot exceed 100 characters"),
  mode: z.enum(["Online", "In Person"]),
  durationMinutes: z
    .number({ message: "Duration is required" })
    .int("Duration must be a whole number of minutes")
    .min(15, "Minimum 15 minutes")
    .max(300, "Maximum 300 minutes"),
  priceIdr: z
    .number({ message: "Price is required" })
    .int("Price must be a whole number")
    .min(0, "Price cannot be negative")
    .max(100000000, "Price looks too high — check the digits"),
});

const termsSchema = z
  .boolean()
  .refine((v) => v === true, "Please confirm before submitting");

export const ApplyProfessionalSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(80, "Full name cannot exceed 80 characters"),
  credentials: z
    .string()
    .min(2, "Credentials are required, e.g. M.Psi., Psikolog")
    .max(200, "Credentials cannot exceed 200 characters"),
  profession: z.enum(PROFESSION_OPTIONS),
  headline: z
    .string()
    .min(10, "Write a short headline about your practice (min 10 characters)")
    .max(160, "Headline cannot exceed 160 characters"),
  bio: z
    .string()
    .min(60, "Tell readers a bit about yourself (min 60 characters)")
    .max(3000, "Bio cannot exceed 3000 characters"),
  baseCity: z
    .string()
    .min(2, "City is required")
    .max(100, "City cannot exceed 100 characters"),
  baseProvince: z
    .string()
    .min(2, "Province is required")
    .max(100, "Province cannot exceed 100 characters"),
  languages: z
    .array(
      z
        .string()
        .min(2, "Each language needs at least 2 characters")
        .max(40, "One language name is too long"),
    )
    .min(1, "Add at least one language you use in sessions")
    .max(6, "Maximum 6 languages"),
  yearsOfExperience: z
    .number({ message: "Years of experience is required" })
    .int("Years must be a whole number")
    .min(0, "Years cannot be negative")
    .max(70, "Years looks too high — check the digits"),
  areaSlugs: z
    .array(
      // Batas 255 mengikuti lebar kolom slug tujuan — nilai lebih panjang
      // tidak mungkin cocok dan cuma membebani query in: [...].
      z.string().min(1).max(255),
    )
    .min(1, "Pick at least one area of support")
    .max(10, "Maximum 10 areas"),
  services: z
    .array(professionalServiceSchema)
    .min(1, "Add at least one session type with its price")
    .max(10, "Maximum 10 session types"),
  licenceType: z
    .string()
    .min(2, "Licence type is required, e.g. STR or SIPP")
    .max(100, "Licence type cannot exceed 100 characters"),
  licenceNumber: z
    .string()
    .min(3, "Licence number is required")
    .max(100, "Licence number cannot exceed 100 characters"),
  licenceValidUntil: validUntilSchema("Licence"),
  acceptTerms: termsSchema,
});

const optionalHttpsUrlSchema = z
  .string()
  .trim()
  .max(255, "Website URL is too long")
  .refine(
    (val) => val === "" || val.startsWith("https://"),
    "Website URL must start with https://",
  )
  .optional();

export const ApplyCareCentreSchema = z.object({
  name: z
    .string()
    .min(3, "Centre name must be at least 3 characters")
    .max(120, "Centre name cannot exceed 120 characters"),
  kind: z.enum(CENTRE_KIND_OPTIONS),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),
  street: z
    .string()
    .min(4, "Street address is required")
    .max(200, "Street address cannot exceed 200 characters"),
  city: z
    .string()
    .min(2, "City is required")
    .max(100, "City cannot exceed 100 characters"),
  province: z
    .string()
    .min(2, "Province is required")
    .max(100, "Province cannot exceed 100 characters"),
  postalCode: z.string().regex(/^\d{5}$/, "Postal code is 5 digits"),
  phone: z
    .string()
    .trim()
    .min(8, "Phone number is required")
    .max(25, "Phone number is too long")
    .regex(/^[+()\d\s-]+$/, "Phone number can only contain digits and + ( ) -"),
  website: optionalHttpsUrlSchema,
  acceptsBpjs: z.boolean(),
  timeZone: z.enum(CENTRE_TIME_ZONE_OPTIONS),
  openingNote: z
    .string()
    .max(300, "Note cannot exceed 300 characters")
    .optional(),
  openingHours: openingHoursSchema,
  serviceSlugs: z
    .array(z.string().min(1).max(255))
    .min(1, "Pick at least one service")
    .max(8, "Maximum 8 services"),
  permitType: z
    .string()
    .min(2, "Permit type is required")
    .max(100, "Permit type cannot exceed 100 characters"),
  permitNumber: z
    .string()
    .min(3, "Permit number is required")
    .max(100, "Permit number cannot exceed 100 characters"),
  permitValidUntil: validUntilSchema("Permit"),
  acceptTerms: termsSchema,
});

export type ApplyProfessionalFormData = z.infer<typeof ApplyProfessionalSchema>;
export type ApplyCareCentreFormData = z.infer<typeof ApplyCareCentreSchema>;
export type ProfessionalServiceFormData = z.infer<
  typeof professionalServiceSchema
>;
export type OpeningHourFormData = z.infer<typeof openingHourSchema>;
export const EditProfessionalSchema = ApplyProfessionalSchema.omit({
  acceptTerms: true,
});

export const EditCareCentreSchema = ApplyCareCentreSchema.omit({
  acceptTerms: true,
});

export type EditProfessionalFormData = z.infer<typeof EditProfessionalSchema>;
export type EditCareCentreFormData = z.infer<typeof EditCareCentreSchema>;
export const PROFESSIONAL_IDENTITY_FIELDS = [
  "fullName",
  "credentials",
  "profession",
  "licenceType",
  "licenceNumber",
  "licenceValidUntil",
] as const;

export const CARE_CENTRE_IDENTITY_FIELDS = [
  "name",
  "kind",
  "street",
  "city",
  "province",
  "postalCode",
  "permitType",
  "permitNumber",
  "permitValidUntil",
] as const;
