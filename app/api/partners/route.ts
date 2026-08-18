import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const companySelect = {
  id: true,
  name: true,
  slug: true,
  logo: true,
  description: true,
  isActive: true,
  location: true,
  website: true,
  phone: true,
  email: true,
  instagram: true,
  linkedln: true,
};

async function getCompanyDetail(companyId: number) {
  const now = new Date();
  const base = { companyId, deletedAt: null, isPublished: true };

  const [totalEvents, upcomingEvents, ongoingEvents, pastEvents, events] =
    await Promise.all([
      prisma.event.count({ where: base }),
      prisma.event.count({ where: { ...base, startDate: { gt: now } } }),
      prisma.event.count({
        where: { ...base, startDate: { lte: now }, endDate: { gte: now } },
      }),
      prisma.event.count({
        where: { ...base, endDate: { lt: now } },
      }),

      prisma.event.findMany({
        where: base,
        orderBy: { startDate: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          startDate: true,
          endDate: true,
          location: true,
          price: true,
          quota: true,
          isPublished: true,
          category: {
            select: { name: true, slug: true },
          },
        },
      }),
    ]);
  return {
    stats: { totalEvents, upcomingEvents, ongoingEvents, pastEvents },
    events,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const activeParams = searchParams.get("active");
    const isActive =
      activeParams === null ? undefined : activeParams === "true";

    const baseWhere = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
    };

    if (id) {
      const company = await prisma.company.findFirst({
        where: {
          ...baseWhere,
          id: Number(id),
        },
        select: companySelect,
      });
      if (!company) {
        return NextResponse.json(
          { message: "Company not Found!" },
          { status: 404 },
        );
      }
      const { events } = await getCompanyDetail(company.id);
      return NextResponse.json({ data: company, events });
    }

    if (slug) {
      const company = await prisma.company.findFirst({
        where: { ...baseWhere, slug },
        select: companySelect,
      });
      if (!company) {
        return NextResponse.json(
          { message: "Company not found!" },
          { status: 404 },
        );
      }
      const { events } = await getCompanyDetail(company.id);
      return NextResponse.json({ data: company, events });
    }

    const companies = await prisma.company.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      select: companySelect,
    });

    return NextResponse.json({ data: companies });
  } catch (error) {
    console.error("GET companies error:", error);
    return NextResponse.json(
      { message: "Failed to fetch companies" },
      { status: 500 },
    );
  }
}
