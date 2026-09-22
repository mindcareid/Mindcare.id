import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

const Industries = [
  "Banking & Financial Services",
  "Technology & Digital",
  "Healthcare & Life Sciences",
  "Education",
  "Human Resources & Talent",
  "Manufacturing",
  "Mining & Natural Resources",
  "Oil, Gas & Energy",
  "Construction & Infrastructure",
  "Real Estate & Property",
  "Retail & E-Commerce",
  "Logistics, Supply Chain & Transportation",
  "Telecommunications",
  "Government & Public Sector",
  "Hospitality, Travel & Tourism",
  "Agriculture, Plantation & Agribusiness",
  "Media, Marketing & Communications",
  "Legal, Risk & Compliance",
  "Professional Services",
  "Consumer Goods (FMCG)",
  "Non-Profit & Associations",
  "Defense, Security & Aerospace",
  "Environmental, ESG & Sustainability",
  "Maritime & Shipping",
  "Cross-Industry / General",
];

const AreasOfSupport: Array<[string, string]> = [
  ["Kecemasan", "kecemasan"],
  ["Stres", "stres"],
  ["Burnout", "burnout"],
  ["Depresi", "depresi"],
  ["Trauma", "trauma"],
  ["Hubungan", "hubungan"],
  ["Pengembangan Diri", "pengembangan-diri"],
  ["Pola Tidur", "pola-tidur"],
  ["Pengasuhan", "pengasuhan"],
  ["Duka Cita", "duka-cita"],
];

const CentreServices: Array<[string, string]> = [
  ["Konsultasi Psikiatri", "konsultasi-psikiatri"],
  ["Psikoterapi", "psikoterapi"],
  ["Tes Psikologi", "tes-psikologi"],
  ["Konseling Keluarga", "konseling-keluarga"],
  ["Konseling Anak & Remaja", "konseling-anak-remaja"],
  ["Terapi Kelompok", "terapi-kelompok"],
  ["Rehabilitasi", "rehabilitasi"],
  ["Layanan Gawat Darurat", "layanan-gawat-darurat"],
];

async function main() {
  console.log("Seeding industries...");

  for (const name of Industries) {
    await prisma.industry.upsert({
      where: { slug: slugify(name, { lower: true, strict: true }) },
      update: {},
      create: {
        name,
        slug: slugify(name, { lower: true, strict: true }),
      },
    });
  }

  console.log("✓ Industries seeded.");

  console.log("Seeding areas of support...");

  for (const [name, slug] of AreasOfSupport) {
    await prisma.areaOfSupport.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }

  console.log("✓ Areas of support seeded.");

  console.log("Seeding centre services...");

  for (const [name, slug] of CentreServices) {
    await prisma.service.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }

  console.log("✓ Centre services seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
