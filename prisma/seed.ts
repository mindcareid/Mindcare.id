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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
