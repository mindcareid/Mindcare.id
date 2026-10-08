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

const SolutionCategories: Array<[name: string, slug: string, theme: string]> = [
  [
    "Employee Assistance Programme & Workplace Wellbeing",
    "eap-workplace-wellbeing",
    "navy",
  ],
  [
    "Mental Health Apps, Platforms & Telehealth",
    "apps-platforms-telehealth",
    "purple",
  ],
  [
    "Assessment, Screening & Measurement Tools",
    "assessment-screening-tools",
    "emerald",
  ],
  [
    "Training, Education & Certification Programmes",
    "training-education-certification",
    "navy",
  ],
  [
    "School & University Mental Health Programmes",
    "schools-universities",
    "purple",
  ],
  [
    "Community, Peer Support & Prevention Programmes",
    "community-peer-support",
    "emerald",
  ],
  ["Mental Health Insurance & Benefits", "insurance-benefits", "navy"],
  [
    "Wellness, Mindfulness & Stress Management Services",
    "wellness-mindfulness",
    "purple",
  ],
  [
    "Books, Publications & Educational Materials",
    "books-publications",
    "emerald",
  ],
  [
    "Other Evidence-Based Mental Health Products & Services",
    "other-evidence-based",
    "navy",
  ],
];

const SolutionAudiences: Array<[name: string, slug: string]> = [
  ["For Individuals", "individuals"],
  ["For Workplaces", "workplaces"],
  ["For Communities", "communities"],
];

const EventCategories: Array<[name: string, slug: string]> = [
  ["Webinar", "webinar"],
  ["Workshop", "workshop"],
  ["Training & Certification", "training-certification"],
  ["Seminar", "seminar"],
  ["Conference", "conference"],
  ["Support Group", "support-group"],
  ["Community Gathering", "community-gathering"],
  ["Screening & Campaign", "screening-campaign"],
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

  console.log("Seeding solution categories...");

  for (const [index, [name, slug, theme]] of SolutionCategories.entries()) {
    await prisma.solutionCategory.upsert({
      where: { slug },
      update: { name, theme, orderIndex: index },
      create: { name, slug, theme, orderIndex: index },
    });
  }

  console.log("✓ Solution categories seeded.");

  console.log("Seeding solution audiences...");

  for (const [name, slug] of SolutionAudiences) {
    await prisma.solutionAudience.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }

  console.log("✓ Solution audiences seeded.");

  console.log("Seeding event categories...");

  for (const [name, slug] of EventCategories) {
    await prisma.eventCategory.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }

  console.log("✓ Event categories seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
