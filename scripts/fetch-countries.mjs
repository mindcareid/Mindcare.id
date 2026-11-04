import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const KEY = process.env.RESTCOUNTRIES_KEY;
const BASE = "https://api.restcountries.com/countries/v5";
const PAGE_LIMIT = 100;
const OUT_FILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../prisma/data/countries.json",
);

async function fetchPage(offset) {
  const url = `${BASE}?limit=${PAGE_LIMIT}&offset=${offset}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${KEY}`, accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(
      `GET ${url} failed with status ${res.status} ${res.statusText}`,
    );
  }

  return res.json();
}

async function fetchAll() {
  const objects = [];

  for (let offset = 0; ; offset += PAGE_LIMIT) {
    const payload = await fetchPage(offset);
    const page = payload?.data?.objects ?? [];
    objects.push(...page);

    if (!payload?.data?.meta?.more) break;
    if (page.length === 0) {
      throw new Error(`Page at offset ${offset} was empty but meta.more=true`);
    }
  }

  return objects;
}
function toRow(country) {
  const alpha2 = country?.codes?.alpha_2?.trim().toUpperCase();
  const name = country?.names?.common?.trim();
  const callingCode = Array.isArray(country?.calling_codes)
    ? country?.calling_codes.filter(Boolean).join(",")
    : "";

  if (!alpha2 || !name) return null;

  return { code: alpha2, name, callingCode: callingCode || null };
}

async function main() {
  const raw = await fetchAll();

  const byCode = new Map();
  for (const country of raw) {
    const row = toRow(country);
    if (!row) continue;
    if (byCode.has(row.code)) {
      console.warn(
        `Duplicate ISO code ${row.code}: kept "${byCode.get(row.code).name}", skipped "${row.name}"`,
      );
      continue;
    }

    byCode.set(row.code, row);
  }

  const countries = [...byCode.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "en"),
  );

  if (countries.length < 200) {
    throw new Error(
      `Only ${countries.length} countries collected — refusing to write, ` +
        "the list looks truncated.",
    );
  }

  const output = {
    generatedAt: new Date().toISOString(),
    source: BASE,
    total: countries.length,
    skipped: raw.length - countries.length,
    countries,
  };

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log(
    `Wrote ${countries.length} countries to prisma/data/countries.json ` +
      `(${output.skipped} entries skipped without ISO code).`,
  );
}

main().catch((error) => {
  console.error("Failed to fetch countries:", error);
  process.exit(1);
});
