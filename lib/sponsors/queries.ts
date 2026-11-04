import { Prisma, type EventSponsorApplication } from "@prisma/client";

import prisma from "@/lib/prisma";
import {
  SPONSOR_PAGE_SIZE,
  type SponsorApplicationFilters,
  type SponsorBenefit,
} from "@/lib/sponsors/shared";
import { E164_PATTERN, phoneStartsWithAnyDialCode } from "@/lib/sponsors/phone";

export const SPONSOR_PUBLIC_EVENT_WHERE = {
  publisherType: "PLATFORM" as const,
  status: "PUBLISHED" as const,
  deletedAt: null,
};

/**
 * Satu-satunya definisi "event sudah berakhir" untuk sponsorship.
 *
 * Sebelumnya halaman form memakai `endDate: { gt: now }` (berakhir saat
 * `endDate <= now`) sementara API memakai `endDate < now`, sehingga tepat pada
 * detik `endDate` halaman sudah menutup section tapi API masih menerima
 * pengajuan. Kedua sisi sekarang memanggil fungsi ini.
 */
export function isSponsorshipEnded(endDate: Date, now: Date = new Date()): boolean {
  return endDate.getTime() <= now.getTime();
}

export function normalizeBenefits(
  value: Prisma.JsonValue | null,
): SponsorBenefit[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const title = typeof item.title === "string" ? item.title : "";
    const detail = typeof item.detail === "string" ? item.detail : undefined;
    return title ? [{ title, ...(detail ? { detail } : {}) }] : [];
  });
}

export async function getPublicSponsorTiers(eventId: number) {
  return prisma.eventSponsorTier.findMany({
    where: { eventId, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { priceAmount: "desc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      priceAmount: true,
      currency: true,
      displayUsd: true,
      benefits: true,
    },
  });
}

/**
 * Dipakai GET /api/cadmin/events/[id]/sponsor-tiers. Query yang sama pernah
 * di-inline di route itu; sekarang satu sumber saja.
 */
export async function listAdminSponsorTiers(eventId: number) {
  const tiers = await prisma.eventSponsorTier.findMany({
    where: { eventId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      priceAmount: true,
      currency: true,
      displayUsd: true,
      fxRateUsed: true,
      benefits: true,
      isActive: true,
      sortOrder: true,
      _count: { select: { applications: true } },
    },
  });

  return tiers.map(({ _count, benefits, ...tier }) => ({
    ...tier,
    benefits: normalizeBenefits(benefits),
    applicationCount: _count.applications,
  }));
}

/**
 * Pilihan event untuk dropdown filter admin.
 *
 * Dibatasi pada event terbaru, bukan seluruh riwayat: dropdown tidak berguna
 * untuk event bertahun-tahun lalu, dan daftar ini dimuat setiap kali admin
 * mengubah filter/pencarian. Tanpa batas, biayanya tumbuh terus seiring
 * bertambahnya event.
 */
export const SPONSOR_EVENT_FILTER_LIMIT = 100;

export async function listPlatformEventsForFilter() {
  return prisma.event.findMany({
    where: { deletedAt: null, publisherType: "PLATFORM" },
    orderBy: [{ startDate: "desc" }, { id: "desc" }],
    take: SPONSOR_EVENT_FILTER_LIMIT,
    select: { id: true, title: true, startDate: true },
  });
}

const listSelect = {
  id: true,
  referenceNo: true,
  status: true,
  companyName: true,
  countryCode: true,
  picFirstName: true,
  picLastName: true,
  picTitle: true,
  picEmail: true,
  picPhone: true,
  priceAmountSnapshot: true,
  currencySnapshot: true,
  displayUsdSnapshot: true,
  createdAt: true,
  emailSentAt: true,
  event: { select: { id: true, title: true, slug: true } },
  tier: { select: { id: true, name: true, isActive: true } },
} satisfies Prisma.EventSponsorApplicationSelect;

export function buildSponsorWhere(
  filters: SponsorApplicationFilters,
): Prisma.EventSponsorApplicationWhereInput {
  const where: Prisma.EventSponsorApplicationWhereInput = {};

  if (filters.eventId) where.eventId = filters.eventId;
  if (filters.status) where.status = filters.status;

  if (filters.search) {
    const q = filters.search;
    where.OR = [
      { companyName: { contains: q } },
      { referenceNo: { contains: q } },
      { picEmail: { contains: q } },
      { picFirstName: { contains: q } },
      { picLastName: { contains: q } },
      { picPhone: { contains: q } },
    ];
  }

  return where;
}

export async function loadSponsorApplications(
  filters: SponsorApplicationFilters,
) {
  const where = buildSponsorWhere(filters);

  const [total, rows] = await Promise.all([
    prisma.eventSponsorApplication.count({ where }),
    prisma.eventSponsorApplication.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (filters.page - 1) * SPONSOR_PAGE_SIZE,
      take: SPONSOR_PAGE_SIZE,
      select: listSelect,
    }),
  ]);

  return { rows, total };
}

/**
 * Jumlah per status untuk kartu ringkasan.
 *
 * `status` filter SENGAJA diabaikan: kartu ringkasan dipakai untuk berpindah
 * status, jadi angkanya harus selalu mencerminkan semua status. Tanpa catatan
 * ini, angka kartu tampak bertentangan dengan "Total N" pada tabel yang
 * terfilter. `scopedTotal` disertakan supaya UI bisa menyebut cakupannya.
 */
export async function loadSponsorSummary(
  filters: Pick<SponsorApplicationFilters, "eventId" | "search">,
) {
  const base = buildSponsorWhere({ ...filters, page: 1 });
  const [pending, reviewed, archived] = await Promise.all([
    prisma.eventSponsorApplication.count({
      where: { ...base, status: "PENDING" },
    }),
    prisma.eventSponsorApplication.count({
      where: { ...base, status: "REVIEWED" },
    }),
    prisma.eventSponsorApplication.count({
      where: { ...base, status: "ARCHIVED" },
    }),
  ]);

  return { pending, reviewed, archived, total: pending + reviewed + archived };
}

const detailSelect = {
  ...listSelect,
  address: true,
  website: true,
  companyEmail: true,
  picPosition: true,
  notes: true,
  emailError: true,
  updatedAt: true,
  benefitsSnapshot: true,
  tier: {
    select: {
      id: true,
      name: true,
      isActive: true,
      priceAmount: true,
      benefits: true,
    },
  },
} satisfies Prisma.EventSponsorApplicationSelect;

export type SponsorApplicationDetail =
  Prisma.EventSponsorApplicationGetPayload<{
    select: typeof detailSelect;
  }>;

export async function findSponsorApplication(id: number) {
  return prisma.eventSponsorApplication.findUnique({
    where: { id },
    select: detailSelect,
  });
}

export async function updateSponsorApplicationStatus(
  id: number,
  status: EventSponsorApplication["status"],
) {
  return prisma.eventSponsorApplication.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });
}

export async function loadSponsorApplicationsForExport(
  filters: Omit<SponsorApplicationFilters, "page">,
  maxRows: number,
) {
  const where = buildSponsorWhere({ ...filters, page: 1 });

  const total = await prisma.eventSponsorApplication.count({ where });
  if (total > maxRows) {
    return {
      tooMany: true as const,
      total,
      rows: [] as SponsorApplicationDetail[],
    };
  }

  const rows = await prisma.eventSponsorApplication.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: maxRows,
    select: detailSelect,
  });

  return { tooMany: false as const, total, rows };
}

/**
 * Cek silang negara & telepon terhadap tabel `Country`.
 *
 * `countryCode` harus ada di daftar, dan kode panggil nomor telepon harus
 * salah satu kode milik negara itu. Tanpa cek kedua, "negara Singapore"
 * dengan nomor "+62..." akan lolos dan baru ketahuan saat tim sponsor
 * menelepon.
 *
 * `lookup` bisa diganti supaya aturan ini bisa diuji tanpa database; bawaan
 * membaca tabel Country. Aturannya sendiri tidak bergantung pada Prisma.
 */
export async function validateCountryAndPhone(
  { countryCode, phone }: { countryCode: string; phone: string },
  lookup: (
    code: string,
  ) => Promise<{ code: string; callingCode: string | null } | null> = (code) =>
    prisma.country.findUnique({
      where: { code },
      select: { code: true, callingCode: true },
    }),
): Promise<
  | { ok: true }
  | { ok: false; field: "countryCode" | "picPhone"; message: string }
> {
  const country = await lookup(countryCode);

  if (!country) {
    return {
      ok: false,
      field: "countryCode",
      message: "Select the country from the list",
    };
  }

  // Jangan menebak batas kode lewat regex: kode panggil panjangnya 1–3 digit
  // dan bersambung langsung dengan nomor ("+62" + "812..."). Yang benar adalah
  // MENGUJI kode-kode milik negara ini terhadap awalan nomor. Percobaan
  // regex greedy pernah menangkap "6281" dan menolak nomor Indonesia sah.
  //
  // Aturan bentuk nomor dan pencocokan kode panggil tinggal di
  // `lib/sponsors/phone.ts` supaya klien dan server memakai logika yang sama.
  const isE164 = E164_PATTERN.test(phone);
  const dialCodeMatches = phoneStartsWithAnyDialCode(phone, [country.callingCode]);

  if (!isE164 || !dialCodeMatches) {
    return {
      ok: false,
      field: "picPhone",
      message:
        "This phone number does not match the selected country. Use “Different country” if the contact person is based elsewhere.",
    };
  }

  return { ok: true };
}
