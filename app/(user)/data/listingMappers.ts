import type { Prisma } from "@prisma/client";
import slugify from "slugify";
import type {
  Verification,
  VerificationReview,
  VerificationSource,
} from "./verification";
import type { Professional } from "../professionals/type/professional";
import type { CareCentre } from "../care-centres/type/careCentre";

export const PUBLIC_PROFESSIONAL_SELECT = {
  id: true,
  slug: true,
  fullName: true,
  credentials: true,
  profession: true,
  headline: true,
  bio: true,
  photoUrl: true,
  baseCity: true,
  baseProvince: true,
  languages: true,
  yearsOfExperience: true,
  startingPriceIdr: true,
  createdAt: true,
  verificationReview: true,
  verificationCheckedOn: true,
  verificationValidUntil: true,
  verificationSource: true,
  services: {
    select: {
      id: true,
      name: true,
      mode: true,
      durationMinutes: true,
      priceIdr: true,
    },
    orderBy: { priceIdr: "asc" },
  },
  areas: {
    select: { area: { select: { id: true, slug: true, name: true } } },
  },
} satisfies Prisma.ProfessionalSelect;

export const PUBLIC_CARE_CENTRE_SELECT = {
  id: true,
  slug: true,
  name: true,
  kind: true,
  photoUrl: true,
  description: true,
  street: true,
  city: true,
  province: true,
  postalCode: true,
  phone: true,
  website: true,
  acceptsBpjs: true,
  timeZone: true,
  openingNote: true,
  latitude: true,
  longitude: true,
  createdAt: true,
  verificationReview: true,
  verificationCheckedOn: true,
  verificationValidUntil: true,
  verificationSource: true,
  openingHours: { select: { day: true, opens: true, closes: true } },
  services: {
    select: { service: { select: { id: true, slug: true, name: true } } },
  },
} satisfies Prisma.CareCentreSelect;

export type PublicProfessionalRow = Prisma.ProfessionalGetPayload<{
  select: typeof PUBLIC_PROFESSIONAL_SELECT;
}>;

export type PublicCareCentreRow = Prisma.CareCentreGetPayload<{
  select: typeof PUBLIC_CARE_CENTRE_SELECT;
}>;

const PROFESSION_LABELS: Record<string, Professional["profession"]> = {
  PSIKOLOG: "Psikolog",
  PSIKIATER: "Psikiater",
  KONSELOR: "Konselor",
};

const CENTRE_KIND_LABELS: Record<string, CareCentre["kind"]> = {
  KLINIK: "Klinik",
  RUMAH_SAKIT: "Rumah Sakit",
  PUSKESMAS: "Puskesmas",
  PUSAT_KONSELING: "Pusat Konseling",
};

const SESSION_MODE_LABELS: Record<
  string,
  Professional["sessionModes"][number]
> = {
  ONLINE: "Online",
  IN_PERSON: "In Person",
};

const REVIEW_VALUES: Record<string, VerificationReview> = {
  NONE: "none",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  REVOKED: "revoked",
};

const SOURCE_VALUES: Record<string, VerificationSource> = {
  SUBMISSION: "submission",
  REGISTRY: "registry",
};

function toDateOnly(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

function toVerification(row: {
  verificationReview: string;
  verificationCheckedOn: Date | null;
  verificationValidUntil: Date | null;
  verificationSource: string | null;
}): Verification {
  const review = REVIEW_VALUES[row.verificationReview] ?? "none";
  const hasResult =
    review === "approved" || review === "rejected" || review === "revoked";

  return {
    review,
    checkedOn: hasResult ? toDateOnly(row.verificationCheckedOn) : null,
    validUntil:
      review === "approved" ? toDateOnly(row.verificationValidUntil) : null,
    source:
      hasResult && row.verificationSource
        ? (SOURCE_VALUES[row.verificationSource] ?? null)
        : null,
  };
}


function toParagraphs(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function toLanguageList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function mapProfessional(row: PublicProfessionalRow): Professional {
  const services = row.services.map((service) => ({
    id: String(service.id),
    slug: slugify(service.name, { lower: true, strict: true }),
    name: service.name,
    mode: SESSION_MODE_LABELS[service.mode] ?? "Online",
    durationMinutes: service.durationMinutes,
    priceIdr: service.priceIdr,
  }));

  const sessionModes = [
    ...new Set(services.map((service) => service.mode)),
  ].sort((a, b) => a.localeCompare(b));

  const startingPriceIdr =
    row.startingPriceIdr ??
    (services.length
      ? Math.min(...services.map((service) => service.priceIdr))
      : 0);

  return {
    id: String(row.id),
    slug: row.slug,
    fullName: row.fullName,
    credentials: row.credentials,
    profession: PROFESSION_LABELS[row.profession] ?? "Psikolog",
    photoUrl: row.photoUrl,
    verification: toVerification(row),
    isAvailableNow: false,
    areasOfSupport: row.areas.map((entry) => ({
      id: String(entry.area.id),
      slug: entry.area.slug,
      name: entry.area.name,
    })),
    sessionModes,
    location: { city: row.baseCity, province: row.baseProvince },
    languages: toLanguageList(row.languages),
    yearsOfExperience: row.yearsOfExperience,
    startingPriceIdr,
    createdAt: row.createdAt.toISOString(),
    headline: row.headline,
    bio: toParagraphs(row.bio),
    approaches: [],
    education: [],
    services,
    bookingUrl: null,
  };
}

export function mapCareCentre(row: PublicCareCentreRow): CareCentre {
  const hoursByDay = new Map(row.openingHours.map((hour) => [hour.day, hour]));
  const openingHours = [1, 2, 3, 4, 5, 6, 7].map((day) => {
    const hour = hoursByDay.get(day);
    return {
      day: day as CareCentre["openingHours"][number]["day"],
      opens: hour?.opens ?? null,
      closes: hour?.closes ?? null,
    };
  });

  return {
    id: String(row.id),
    slug: row.slug,
    name: row.name,
    kind: CENTRE_KIND_LABELS[row.kind] ?? "Klinik",
    photoUrl: row.photoUrl,
    verification: toVerification(row),
    openingHours,
    openingNote: row.openingNote,
    timeZone: row.timeZone,
    services: row.services.map((entry) => ({
      id: String(entry.service.id),
      slug: entry.service.slug,
      name: entry.service.name,
    })),
    address: {
      street: row.street,
      city: row.city,
      province: row.province,
      postalCode: row.postalCode,
    },
    coordinates:
      row.latitude !== null && row.longitude !== null
        ? { latitude: row.latitude, longitude: row.longitude }
        : null,
    phone: row.phone,
    acceptsBpjs: row.acceptsBpjs,
    professionalSlugs: [],
    professionalCount: 0,
    createdAt: row.createdAt.toISOString(),
  };
}
