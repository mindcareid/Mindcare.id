// Backfill kode wilayah (BPS) untuk baris lama yang sudah punya nama
// kota/provinsi teks-bebas tetapi belum punya kode.
//
// Menyamakan nama ke bentuk kanonik EMSIFA sekaligus mengisi kode, supaya
// filter `[city, province]` / `[baseCity]` tetap konsisten dengan entri baru
// yang dibuat lewat dropdown. Idempoten: baris yang kodenya sudah terisi
// dilewati.
//
//   node scripts/backfill-wilayah-codes.mjs
//
// Dipakai sekali setelah migrasi add_wilayah_regions. Aman dijalankan ulang.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// "Kota Administrasi Jakarta Selatan" dan "Jakarta Selatan" harus dianggap sama.
function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(
      /\b(kota administrasi|kabupaten administrasi|kota|kabupaten|kab)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

// Provinsi yang namanya lazim disingkat, jadi tidak ketemu lewat normalize.
const PROVINCE_ALIASES = {
  "dki jakarta": "31",
  "di yogyakarta": "34",
};

function pickRegency(candidates) {
  if (candidates.length <= 1) return candidates[0] ?? null;
  // Ambigu (mis. "Bandung" cocok ke Kota Bandung dan Kabupaten Bandung):
  // utamakan kota, karena listing praktik/klinik hampir selalu di kota.
  const kota = candidates.find((entry) => entry.name.startsWith("Kota"));
  return kota ?? candidates[0];
}

async function main() {
  const provinces = await prisma.province.findMany();
  const regencies = await prisma.regency.findMany();

  const provinceById = new Map(provinces.map((p) => [p.id, p]));
  const provinceByNorm = new Map(
    provinces.map((p) => [normalize(p.name), p]),
  );
  const regenciesByNorm = new Map();
  for (const regency of regencies) {
    const key = normalize(regency.name);
    const list = regenciesByNorm.get(key) ?? [];
    list.push(regency);
    regenciesByNorm.set(key, list);
  }

  // Cari provinsi dari nama bebas: langsung, alias, atau lewat kota.
  function resolve(provinceName, cityName) {
    if (cityName) {
      const matches = regenciesByNorm.get(normalize(cityName)) ?? [];
      const regency = pickRegency(matches);
      if (regency) {
        const province = provinceById.get(regency.provinceId) ?? null;
        return {
          cityCode: regency.id,
          cityName: regency.name,
          provinceCode: province?.id ?? null,
          provinceName: province?.name ?? null,
        };
      }
    }
    if (provinceName) {
      const norm = normalize(provinceName);
      const province =
        provinceByNorm.get(norm) ??
        provinceById.get(PROVINCE_ALIASES[norm] ?? "") ??
        null;
      if (province) {
        return {
          cityCode: null,
          cityName: null,
          provinceCode: province.id,
          provinceName: province.name,
        };
      }
    }
    return null;
  }

  let centres = 0;
  const centreRows = await prisma.careCentre.findMany({
    where: { OR: [{ cityCode: null }, { provinceCode: null }] },
    select: { id: true, city: true, province: true },
  });
  for (const row of centreRows) {
    const match = resolve(row.province, row.city);
    if (!match || !match.provinceCode) {
      console.warn(`[care-centre ${row.id}] tidak cocok: ${row.city}, ${row.province}`);
      continue;
    }
    await prisma.careCentre.update({
      where: { id: row.id },
      data: {
        city: match.cityName ?? row.city,
        province: match.provinceName ?? row.province,
        cityCode: match.cityCode,
        provinceCode: match.provinceCode,
      },
    });
    centres += 1;
  }

  let professionals = 0;
  const professionalRows = await prisma.professional.findMany({
    where: { OR: [{ baseCityCode: null }, { baseProvinceCode: null }] },
    select: { id: true, baseCity: true, baseProvince: true },
  });
  for (const row of professionalRows) {
    const match = resolve(row.baseProvince, row.baseCity);
    if (!match || !match.provinceCode) {
      console.warn(
        `[professional ${row.id}] tidak cocok: ${row.baseCity}, ${row.baseProvince}`,
      );
      continue;
    }
    await prisma.professional.update({
      where: { id: row.id },
      data: {
        baseCity: match.cityName ?? row.baseCity,
        baseProvince: match.provinceName ?? row.baseProvince,
        baseCityCode: match.cityCode,
        baseProvinceCode: match.provinceCode,
      },
    });
    professionals += 1;
  }

  console.log(
    `Backfilled ${centres} care centres and ${professionals} professionals.`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to backfill wilayah codes:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
