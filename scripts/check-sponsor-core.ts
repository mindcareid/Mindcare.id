import {
  buildReferenceNo,
  generateSponsorReferenceNo,
} from "../lib/sponsors/reference";
import {
  sponsorApplicationSchema,
  sponsorTierSchema,
} from "../lib/validations/sponsor";

let failures = 0;
function check(name: string, ok: boolean, extra?: unknown) {
  if (ok) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${name}`, extra ?? "");
  }
}

async function referenceTests() {
  console.log("reference numbers");

  const sample = buildReferenceNo(new Date("2026-11-03T10:00:00Z"));
  check(
    "format SPN-YYYY-MM-XXXXXX",
    /^SPN-2026-11-[2-9A-HJKMNP-Z]{6}$/.test(sample),
    sample,
  );

  const ambiguous = /[01OIL]/;
  let hasAmbiguous = false;
  for (let i = 0; i < 500; i += 1) {
    if (
      ambiguous.test(
        buildReferenceNo(new Date("2026-11-03T10:00:00Z")).slice(13),
      )
    ) {
      hasAmbiguous = true;
      break;
    }
  }
  check("tidak memakai karakter ambigu 0/O/1/I/L", !hasAmbiguous);

  const seen = new Set<string>();
  for (let i = 0; i < 2000; i += 1) seen.add(buildReferenceNo());
  check("2000 nomor berbeda semua", seen.size === 2000, `unique=${seen.size}`);

  // Kalau ada nomor yang bentrok, fungsi harus mencoba lagi, bukan gagal.
  let calls = 0;
  const retried = await generateSponsorReferenceNo(
    new Date("2026-11-03"),
    async () => {
      calls += 1;
      return calls <= 2; // dua percobaan pertama "sudah dipakai"
    },
  );
  check(
    "mencoba ulang saat bentrok",
    calls === 3 && /^SPN-2026-11-/.test(retried),
    retried,
  );
}

const validApplication = {
  eventId: 1,
  tierId: 3,
  companyName: "Acme Health",
  address: "Jl. Sudirman No. 1, Jakarta",
  countryCode: "id",
  website: "https://acme.com",
  companyEmail: "",
  picFirstName: "Rina",
  picLastName: "Pratiwi",
  picTitle: "",
  picPosition: "Head of Partnerships",
  picPhone: "+6281234567890",
  picEmail: "RINA@ACME.COM",
  notes: "",
  captchaToken: "x",
};

async function applicationTests() {
  console.log("sponsor application schema");

  const ok = sponsorApplicationSchema.safeParse(validApplication);
  check("pengajuan wajar lolos", ok.success, ok.success ? "" : ok.error.issues);
  if (ok.success) {
    check(
      "countryCode di-uppercase",
      ok.data.countryCode === "ID",
      ok.data.countryCode,
    );
    check(
      "email PIC di-lowercase",
      ok.data.picEmail === "rina@acme.com",
      ok.data.picEmail,
    );
    check(
      "website kosong jadi null",
      ok.data.companyEmail === null,
      ok.data.companyEmail,
    );
    check(
      "title kosong jadi null",
      ok.data.picTitle === null,
      ok.data.picTitle,
    );
    check("notes kosong jadi null", ok.data.notes === null, ok.data.notes);
  }

  const cases: [string, Record<string, unknown>, string][] = [
    ["tanpa paket", { tierId: undefined }, "tierId"],
    ["nama perusahaan kosong", { companyName: "" }, "companyName"],
    ["negara bukan ISO2", { countryCode: "Indonesia" }, "countryCode"],
    ["title bukan pilihan", { picTitle: "Lord" }, "picTitle"],
    ["telepon bukan E.164", { picPhone: "0812345678" }, "picPhone"],
    ["email PIC rusak", { picEmail: "bukan-email" }, "picEmail"],
    ["email perusahaan rusak", { companyEmail: "salah" }, "companyEmail"],
    ["website tanpa http", { website: "acme.com" }, "website"],
    ["notes > 1000", { notes: "a".repeat(1001) }, "notes"],
  ];

  for (const [label, patch, field] of cases) {
    const result = sponsorApplicationSchema.safeParse({
      ...validApplication,
      ...patch,
    });
    const fieldFailed =
      !result.success && result.error.issues.some((i) => i.path[0] === field);
    check(
      `ditolak: ${label}`,
      fieldFailed,
      result.success ? "lolos padahal harusnya gagal" : "",
    );
  }

  const emptyOptionalOk = sponsorApplicationSchema.safeParse({
    ...validApplication,
    website: "",
    companyEmail: "finance@acme.com",
    picTitle: "Dr",
  });
  check(
    "opsional kosong/terisi diterima",
    emptyOptionalOk.success,
    emptyOptionalOk.success ? "" : emptyOptionalOk.error.issues,
  );
}

const validTier = {
  name: "Gold Sponsor",
  priceAmount: 50000000,
  displayUsd: 3030,
  fxRateUsed: 16500,
  benefits: [
    { title: "Video Looping" },
    { title: "Booth Size/Type", detail: "4m x 2m" },
  ],
  isActive: true,
  sortOrder: 1,
};

async function tierTests() {
  console.log("sponsor tier schema");

  const ok = sponsorTierSchema.safeParse(validTier);
  check("paket wajar lolos", ok.success, ok.success ? "" : ok.error.issues);

  const usdWithoutRate = sponsorTierSchema.safeParse({
    ...validTier,
    fxRateUsed: null,
  });
  check(
    "USD tanpa kurs ditolak",
    !usdWithoutRate.success &&
      usdWithoutRate.error.issues.some((i) => i.path[0] === "fxRateUsed"),
    usdWithoutRate.success ? "lolos" : "",
  );

  const rateWithoutUsd = sponsorTierSchema.safeParse({
    ...validTier,
    displayUsd: null,
  });
  check(
    "kurs tanpa USD diterima",
    rateWithoutUsd.success,
    rateWithoutUsd.success ? "" : rateWithoutUsd.error.issues,
  );

  for (const [label, patch] of [
    ["harga 0", { priceAmount: 0 }],
    ["harga desimal", { priceAmount: 50000000.5 }],
    ["harga negatif", { priceAmount: -1 }],
    ["benefit tanpa judul", { benefits: [{ detail: "x" }] }],
  ] as const) {
    const result = sponsorTierSchema.safeParse({ ...validTier, ...patch });
    check(`ditolak: ${label}`, !result.success);
  }
}

async function main() {
  await referenceTests();
  await applicationTests();
  await tierTests();

  console.log(failures === 0 ? "\nALL PASS" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
