import { z } from "zod";

import { phoneSchema } from "./auth";
import { PIC_TITLES } from "@/lib/sponsors/shared";

const MAX_BENEFITS = 40;
const MAX_BENEFIT_TITLE = 120;
const MAX_BENEFIT_DETAIL = 200;
const MAX_PRICE = 100_000_000_000;

/**
 * Pola email & URL untuk validasi klien.
 *
 * Form sponsor (komponen klien) memakai pola ini supaya aturan yang dilihat
 * pengguna sama dengan aturan yang ditegakkan Zod di server. Tanpa ini,
 * input seperti "a@b.c" lolos klien lalu ditolak server setelah captcha
 * terpakai, dan pengguna hanya melihat pesan umum.
 */
export const SPONSOR_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const SPONSOR_WEBSITE_PATTERN = /^https?:\/\/[^\s]+\.[^\s]+$/i;

/** Batas panjang yang sama dipakai klien, diambil dari sini sebagai rujukan. */
export const SPONSOR_LIMITS = {
  companyName: 255,
  address: 2000,
  website: 500,
  personName: 120,
  position: 255,
  notes: 1000,
} as const;

const countryCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(z.string().regex(/^[A-Z]{2}$/, "Select the country"));

const websiteSchema = z
  .string()
  .trim()
  .max(SPONSOR_LIMITS.website, "Website cannot exceed 500 characters")
  .refine(
    (value) => value === "" || SPONSOR_WEBSITE_PATTERN.test(value),
    "Enter a full URL, e.g. https://example.com",
  )
  .transform((value) => (value === "" ? null : value));

const benefitSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Benefit title is required")
    .max(
      MAX_BENEFIT_TITLE,
      `Benefit title cannot exceed ${MAX_BENEFIT_TITLE} characters`,
    ),
  detail: z
    .string()
    .trim()
    .max(
      MAX_BENEFIT_DETAIL,
      `Benefit detail cannot exceed ${MAX_BENEFIT_DETAIL} characters`,
    )
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export const sponsorTierSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Package name is required")
      .max(120, "Package name cannot exceed 120 characters"),

    priceAmount: z
      .number({ error: "Price is required" })
      .int("Price must be a whole number")
      .positive("Price must be greater than zero")
      .max(MAX_PRICE, "Price looks too large"),

    displayUsd: z
      .number()
      .int("USD estimate must be a whole number")
      .positive("USD estimate must be greater than zero")
      .max(10_000_000, "USD estimate looks too large")
      .optional()
      .nullable(),

    fxRateUsed: z
      .number()
      .int("Exchange rate must be a whole number")
      .positive("Exchange rate must be greater than zero")
      .max(1_000_000, "Exchange rate looks too large")
      .optional()
      .nullable(),

    benefits: z
      .array(benefitSchema)
      .max(MAX_BENEFITS, `You can add at most ${MAX_BENEFITS} benefits`),

    isActive: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(999).default(0),
  })
  .refine((data) => !(data.displayUsd && !data.fxRateUsed), {
    path: ["fxRateUsed"],
    message: "Add the exchange rate used for the USD estimate",
  });

export const sponsorApplicationSchema = z.object({
  eventId: z.number().int().positive(),

  tierId: z
    .number({ error: "Choose a sponsorship package" })
    .int()
    .positive("Choose a sponsorship package"),

  // ── Company info
  companyName: z
    .string()
    .trim()
    .min(2, "Company name is required")
    .max(SPONSOR_LIMITS.companyName, "Company name cannot exceed 255 characters"),

  address: z
    .string()
    .trim()
    .min(5, "Company address is required")
    .max(SPONSOR_LIMITS.address, "Company address cannot exceed 2000 characters"),

  countryCode: countryCodeSchema,

  website: websiteSchema,

  companyEmail: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .toLowerCase()
        .pipe(z.email({ message: "Enter a valid company email" })),
    ])
    .optional()
    .transform((value) => (value ? value : null)),

  // ── Contact person
  picFirstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(SPONSOR_LIMITS.personName, "First name cannot exceed 120 characters"),

  picLastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(SPONSOR_LIMITS.personName, "Last name cannot exceed 120 characters"),

  picTitle: z
    .union([z.literal(""), z.enum(PIC_TITLES)])
    .optional()
    .transform((value) => (value ? value : null)),

  picPosition: z
    .string()
    .trim()
    .min(2, "Position is required")
    .max(SPONSOR_LIMITS.position, "Position cannot exceed 255 characters"),

  picPhone: phoneSchema,

  picEmail: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: "Enter a valid email address" })),

  notes: z
    .string()
    .trim()
    .max(SPONSOR_LIMITS.notes, "Note cannot exceed 1000 characters")
    .optional()
    .transform((value) => (value ? value : null)),

  captchaToken: z.string().max(4096).optional(),
});

export const updateSponsorStatusSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "ARCHIVED"]),
});
