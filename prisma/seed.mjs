import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const target = (process.env.DATABASE_URL ?? "").replace(
    /:\/\/[^@]*@/,
    "://***@",
  );

  const file = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "data/wilayah.json",
  );
  const payload = JSON.parse(await readFile(file, "utf8"));

  for (const province of payload.provinces) {
    await prisma.province.upsert({
      where: { id: province.id },
      update: { name: province.name },
      create: { id: province.id, name: province.name },
    });
  }

  for (const regency of payload.regencies) {
    await prisma.regency.upsert({
      where: { id: regency.id },
      update: { name: regency.name, provinceId: regency.provinceId },
      create: {
        id: regency.id,
        name: regency.name,
        provinceId: regency.provinceId,
      },
    });
  }

  console.log(
    `Seeded ${payload.provinces.length} provinces and ${payload.regencies.length} regencies.`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed wilayah:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
