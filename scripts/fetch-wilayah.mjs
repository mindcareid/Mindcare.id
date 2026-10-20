import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "https://www.emsifa.com/api-wilayah-indonesia/v2";
const OUT_FILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../prisma/data/wilayah.json",
);

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`GET ${url} failed with status ${res.status}`);
  }
  return res.json();
}

async function main() {
  const provincesPayload = await fetchJson(`${BASE}/provinces.json`);
  const provinces = provincesPayload.data.map((p) => ({
    id: String(p.id),
    name: p.name,
  }));

  const regencies = [];
  for (const province of provinces) {
    const payload = await fetchJson(`${BASE}/regencies/${province.id}.json`);
    for (const regency of payload.data) {
      regencies.push({
        id: String(regency.id),
        name: regency.name,
        provinceId: province.id,
      });
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    source: BASE,
    provinces,
    regencies,
  };

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log(
    `Wrote ${provinces.length} provinces and ${regencies.length} regencies to prisma/data/wilayah.json`,
  );
}

main().catch((error) => {
  console.error("Failed to fetch wilayah data:", error);
  process.exit(1);
});
