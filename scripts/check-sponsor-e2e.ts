import prisma from "../lib/prisma";
import {
  getPublicSponsorTiers,
  normalizeBenefits,
  updateSponsorApplicationStatus,
  validateCountryAndPhone,
} from "../lib/sponsors/queries";
import { generateSponsorReferenceNo } from "../lib/sponsors/reference";

let failures = 0;
function check(name: string, ok: boolean, extra?: unknown) {
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}`, ok ? "" : (extra ?? ""));
  if (!ok) failures += 1;
}

const TEST_EVENT_SLUG =
  "mental-health-and-wellness-exhibition-and-conference-2026";

function assertLocalDatabase() {
  const url = process.env.DATABASE_URL ?? "";
  const host = url.replace(/^mysql:\/\/[^@]*@/, "").split(/[:/?]/)[0];

  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host === "::1";

  if (!isLocal && process.env.ALLOW_REMOTE_DB !== "1") {
    console.error(
      `\nDITOLAK: DATABASE_URL menunjuk ke host "${host}" (bukan lokal).\n` +
        "Script ini menghapus data. Kalau benar-benar niat, jalankan dengan ALLOW_REMOTE_DB=1.\n",
    );
    process.exit(1);
  }
}

async function main() {
  assertLocalDatabase();

  const event = await prisma.event.findFirst({
    where: {
      slug: TEST_EVENT_SLUG,
      publisherType: "PLATFORM",
      status: "PUBLISHED",
    },
    select: { id: true, title: true },
  });

  if (!event) {
    throw new Error(`Test event not found: ${TEST_EVENT_SLUG}`);
  }

  console.log(`\nevent #${event.id} â€” ${event.title}`);

  // Bersihkan sisa uji sebelumnya.
  await prisma.eventSponsorApplication.deleteMany({
    where: { eventId: event.id, picEmail: { endsWith: "@sponsor-test.local" } },
  });
  await prisma.eventSponsorTier.deleteMany({
    where: { eventId: event.id, name: { startsWith: "E2E " } },
  });

  console.log("\npaket:");
  const tier = await prisma.eventSponsorTier.create({
    data: {
      eventId: event.id,
      name: "E2E Gold Sponsor",
      priceAmount: 50_000_000,
      currency: "IDR",
      displayUsd: 3030,
      fxRateUsed: 16500,
      benefits: [
        { title: "Seminar Sessions", detail: "20 Minutes" },
        { title: "Booth Size/Type", detail: "4m x 2m" },
        { title: "Video Looping" },
      ],
      sortOrder: 99,
    },
    select: { id: true },
  });

  const publicTiers = await getPublicSponsorTiers(event.id);
  const listed = publicTiers.find((item) => item.id === tier.id);
  check("paket aktif muncul di daftar publik", Boolean(listed));
  check(
    "benefit terbaca berurutan dengan detail",
    Boolean(listed) &&
      normalizeBenefits(listed!.benefits).length === 3 &&
      normalizeBenefits(listed!.benefits)[1].detail === "4m x 2m",
    listed ? normalizeBenefits(listed.benefits) : null,
  );

  const inactive = await prisma.eventSponsorTier.create({
    data: {
      eventId: event.id,
      name: "E2E Hidden",
      priceAmount: 1_000_000,
      isActive: false,
      sortOrder: 100,
    },
    select: { id: true },
  });
  const afterInactive = await getPublicSponsorTiers(event.id);
  check(
    "paket nonaktif tidak muncul publik",
    !afterInactive.some((item) => item.id === inactive.id),
  );
  await prisma.eventSponsorTier.delete({ where: { id: inactive.id } });

  console.log("\nnegara â†” telepon:");
  const matchId = await validateCountryAndPhone({
    countryCode: "ID",
    phone: "+6281234567890",
  });
  check("+62 diterima untuk Indonesia", matchId.ok, matchId);

  const mismatch = await validateCountryAndPhone({
    countryCode: "SG",
    phone: "+6281234567890",
  });
  check(
    "nomor +62 ditolak untuk Singapura",
    !mismatch.ok && mismatch.field === "picPhone",
    mismatch,
  );

  const sgOk = await validateCountryAndPhone({
    countryCode: "SG",
    phone: "+6591234567",
  });
  check("+65 diterima untuk Singapura", sgOk.ok, sgOk);

  const unknown = await validateCountryAndPhone({
    countryCode: "ZZ",
    phone: "+6212345678",
  });
  check(
    "kode negara tak dikenal ditolak",
    !unknown.ok && unknown.field === "countryCode",
    unknown,
  );

  console.log("\npengajuan:");
  const referenceNo = await generateSponsorReferenceNo();
  const created = await prisma.eventSponsorApplication.create({
    data: {
      referenceNo,
      eventId: event.id,
      tierId: tier.id,
      companyName: "E2E Test Ventures",
      address: "Jl. Uji Coba 1",
      countryCode: "ID",
      picFirstName: "Test",
      picLastName: "Person",
      picPosition: "Partnerships Lead",
      picPhone: "+6281234567890",
      picEmail: "e2e@sponsor-test.local",
      priceAmountSnapshot: listed!.priceAmount,
      currencySnapshot: listed!.currency,
      displayUsdSnapshot: listed!.displayUsd,
      // Salinan benefit, seperti yang ditulis route publik.
      benefitsSnapshot: normalizeBenefits(listed!.benefits),
    },
    select: {
      id: true,
      referenceNo: true,
      status: true,
      priceAmountSnapshot: true,
    },
  });

  check(
    "nomor referensi unik & berformat",
    /^SPN-\d{4}-\d{2}-[A-Z0-9]{6}$/.test(created.referenceNo),
    created.referenceNo,
  );
  check("status awal PENDING", created.status === "PENDING", created.status);

  // Harga DAN benefit paket diubah setelah pengajuan. Snapshot tidak boleh ikut.
  await prisma.eventSponsorTier.update({
    where: { id: tier.id },
    data: {
      priceAmount: 75_000_000,
      displayUsd: 4545,
      benefits: [{ title: "E2E Benefit yang diubah setelah pengajuan" }],
    },
  });
  const afterPriceChange = await prisma.eventSponsorApplication.findUnique({
    where: { id: created.id },
    select: {
      priceAmountSnapshot: true,
      displayUsdSnapshot: true,
      benefitsSnapshot: true,
    },
  });
  check(
    "harga pengajuan lama tidak ikut berubah",
    afterPriceChange?.priceAmountSnapshot === 50_000_000 &&
      afterPriceChange?.displayUsdSnapshot === 3030,
    afterPriceChange,
  );

  const snapshottedBenefits = normalizeBenefits(
    afterPriceChange?.benefitsSnapshot ?? null,
  );
  check(
    "benefit pengajuan lama tidak ikut berubah",
    snapshottedBenefits.length === 3 &&
      snapshottedBenefits[1].detail === "4m x 2m",
    snapshottedBenefits,
  );

  const detail = await prisma.eventSponsorApplication.findUnique({
    where: { id: created.id },
    select: {
      companyName: true,
      countryCode: true,
      tier: { select: { name: true } },
    },
  });
  check(
    "detail pengajuan menyertakan paket & negara",
    detail?.companyName === "E2E Test Ventures" && detail?.countryCode === "ID",
    detail,
  );

  const reviewed = await updateSponsorApplicationStatus(created.id, "REVIEWED");
  check("status bisa diubah ke REVIEWED", reviewed.status === "REVIEWED");

  console.log("\npenjagaan hapus paket:");
  const used = await prisma.eventSponsorTier.findFirst({
    where: { id: tier.id },
    select: { _count: { select: { applications: true } } },
  });
  check(
    "paket yang dipakai melaporkan jumlah pengajuan",
    used?._count.applications === 1,
    used,
  );

  let blockedByRestrict = false;
  try {
    await prisma.eventSponsorTier.delete({ where: { id: tier.id } });
  } catch {
    blockedByRestrict = true;
  }
  check("paket yang dipakai tidak bisa dihapus (Restrict)", blockedByRestrict);

  console.log("\npenjagaan hapus event (FK RESTRICT):");
  // Menghapus event tidak boleh ikut menghapus pengajuan sponsor. Ini
  // memeriksa ATURAN FK DI DATABASE, bukan hanya perilaku Prisma, karena
  // `relationMode = "prisma"` bisa menolak lebih dulu tanpa menyentuh FK.
  const fkRules = await prisma.$queryRaw<
    { CONSTRAINT_NAME: string; DELETE_RULE: string }[]
  >`
    SELECT CONSTRAINT_NAME, DELETE_RULE
    FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('eventsponsortier', 'eventsponsorapplication')
  `;

  for (const expected of [
    "EventSponsorTier_eventId_fkey",
    "EventSponsorApplication_eventId_fkey",
    "EventSponsorApplication_tierId_fkey",
  ]) {
    const row = fkRules.find((fk) => fk.CONSTRAINT_NAME === expected);
    check(
      `FK ${expected} memakai RESTRICT`,
      row?.DELETE_RULE === "RESTRICT",
      row ?? "tidak ditemukan",
    );
  }

  // Bukti langsung: dengan pengajuan aktif, hapus event harus gagal.
  let eventDeleteBlocked = false;
  try {
    await prisma.event.delete({ where: { id: event.id } });
  } catch {
    eventDeleteBlocked = true;
  }
  check(
    "event berisi pengajuan sponsor tidak bisa dihapus",
    eventDeleteBlocked,
  );
  const eventStillThere = await prisma.event.count({ where: { id: event.id } });
  check("event tetap ada setelah percobaan hapus", eventStillThere === 1);

  // Bersihkan.
  await prisma.eventSponsorApplication.deleteMany({
    where: { id: created.id },
  });
  await prisma.eventSponsorTier.delete({ where: { id: tier.id } });
  console.log("\n(uji membersihkan datanya sendiri)");

  console.log(failures === 0 ? "\nALL PASS" : `\n${failures} CHECK(S) FAILED`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((error) => {
    console.error("\nE2E sponsor failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Bersihkan walau uji gagal di tengah jalan.
    await prisma.eventSponsorApplication
      .deleteMany({ where: { picEmail: { endsWith: "@sponsor-test.local" } } })
      .catch(() => undefined);
    await prisma.eventSponsorTier
      .deleteMany({ where: { name: { startsWith: "E2E " } } })
      .catch(() => undefined);
    await prisma.$disconnect();
  });
