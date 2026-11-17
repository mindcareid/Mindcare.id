import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminGuard";
import { sponsorSchema } from "@/lib/validations/sponsor";
import {
  listAdminEventSponsors,
  listSponsorTierOptions,
} from "@/lib/sponsors/queries";
import { revalidateEventCacheById } from "@/lib/events/cache";
import { cloudinary } from "@/lib/cloudinary/config";
import {
  isCloudinaryAssetUrl,
  isPublicIdInEntityFolder,
  resourceTypeForPublicId,
  urlMatchesPublicId,
} from "@/lib/cloudinary/asset";

type Params = { params: { id: string } };

function readEventId(params: Params["params"]): number | null {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function ensurePlatformEvent(eventId: number) {
  return prisma.event.findFirst({
    where: {
      id: eventId,
      deletedAt: null,
      publisherType: "PLATFORM",
    },
    select: { id: true, title: true },
  });
}

function logoIsAcceptable(logoUrl: string, logoPublicId: string): boolean {
  if (!isPublicIdInEntityFolder(logoPublicId, "event-sponsor-logos")) {
    return false;
  }
  return (
    isCloudinaryAssetUrl(logoUrl) && urlMatchesPublicId(logoUrl, logoPublicId)
  );
}

async function destroySponsorLogo(logoPublicId: string) {
  try {
    await cloudinary.uploader.destroy(logoPublicId, {
      resource_type: resourceTypeForPublicId(logoPublicId),
    });
  } catch (error) {
    console.error("[SPONSOR_LOGO_DESTROY]", error);
  }
}

async function tierBelongsToEvent(tierId: number, eventId: number) {
  return prisma.eventSponsorTier.findFirst({
    where: { id: tierId, eventId },
    select: { id: true },
  });
}

function badRequest(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function GET(_req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return badRequest("Forbidden!", 403);

  const eventId = readEventId(params);
  if (!eventId) return badRequest("Invalid event id");

  const event = await ensurePlatformEvent(eventId);
  if (!event) {
    return badRequest(
      "Sponsor logos are only available for MindCare platform events",
      404,
    );
  }

  const [sponsors, tiers] = await Promise.all([
    listAdminEventSponsors(eventId),
    listSponsorTierOptions(eventId),
  ]);

  return NextResponse.json({ event, sponsors, tiers });
}

export async function POST(req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return badRequest("Forbidden!", 403);

  const eventId = readEventId(params);
  if (!eventId) return badRequest("Invalid event id");

  const event = await ensurePlatformEvent(eventId);
  if (!event) {
    return badRequest(
      "Sponsor logos are only available for MindCare platform events",
      404,
    );
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = sponsorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed",
        errors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 422 },
    );
  }

  const data = parsed.data;

  if (!(await tierBelongsToEvent(data.tierId, eventId))) {
    return NextResponse.json(
      {
        message: "That package does not belong to this event",
        errors: { tierId: ["That package does not belong to this event"] },
      },
      { status: 422 },
    );
  }

  if (!logoIsAcceptable(data.logoUrl, data.logoPublicId)) {
    return NextResponse.json(
      {
        message: "Upload the logo again through the form",
        errors: { logoUrl: ["Upload the logo again through the form"] },
      },
      { status: 422 },
    );
  }

  const created = await prisma.eventSponsor.create({
    data: {
      eventId,
      tierId: data.tierId,
      name: data.name,
      logoUrl: data.logoUrl,
      logoPublicId: data.logoPublicId,
      websiteUrl: data.websiteUrl ?? null,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
    select: { id: true, name: true },
  });

  await revalidateEventCacheById(eventId);

  return NextResponse.json(
    { message: "Sponsor added", data: created },
    { status: 201 },
  );
}

export async function PATCH(req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return badRequest("Forbidden!", 403);

  const eventId = readEventId(params);
  const sponsorId = Number(new URL(req.url).searchParams.get("sponsorId"));

  if (!eventId || !Number.isInteger(sponsorId) || sponsorId <= 0) {
    return badRequest("Invalid id");
  }

  const existing = await prisma.eventSponsor.findFirst({
    where: { id: sponsorId, eventId },
    select: { id: true, logoUrl: true, logoPublicId: true },
  });
  if (!existing) return badRequest("Sponsor not found", 404);

  const body: unknown = await req.json().catch(() => null);
  const parsed = sponsorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed",
        errors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 422 },
    );
  }

  const data = parsed.data;

  if (!(await tierBelongsToEvent(data.tierId, eventId))) {
    return NextResponse.json(
      {
        message: "That package does not belong to this event",
        errors: { tierId: ["That package does not belong to this event"] },
      },
      { status: 422 },
    );
  }
  const logoUnchanged =
    data.logoUrl === existing.logoUrl &&
    data.logoPublicId === existing.logoPublicId;

  if (!logoUnchanged && !logoIsAcceptable(data.logoUrl, data.logoPublicId)) {
    return NextResponse.json(
      {
        message: "Upload the logo again through the form",
        errors: { logoUrl: ["Upload the logo again through the form"] },
      },
      { status: 422 },
    );
  }

  const updated = await prisma.eventSponsor.update({
    where: { id: sponsorId },
    data: {
      tierId: data.tierId,
      name: data.name,
      logoUrl: data.logoUrl,
      logoPublicId: data.logoPublicId,
      websiteUrl: data.websiteUrl ?? null,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
    select: { id: true, name: true },
  });
  if (!logoUnchanged) {
    await destroySponsorLogo(existing.logoPublicId);
  }

  await revalidateEventCacheById(eventId);

  return NextResponse.json({ message: "Sponsor updated", data: updated });
}

export async function DELETE(req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return badRequest("Forbidden!", 403);

  const eventId = readEventId(params);
  const sponsorId = Number(new URL(req.url).searchParams.get("sponsorId"));

  if (!eventId || !Number.isInteger(sponsorId) || sponsorId <= 0) {
    return badRequest("Invalid id");
  }

  const existing = await prisma.eventSponsor.findFirst({
    where: { id: sponsorId, eventId },
    select: { id: true, logoPublicId: true },
  });
  if (!existing) return badRequest("Sponsor not found", 404);
  await prisma.eventSponsor.delete({ where: { id: sponsorId } });
  await destroySponsorLogo(existing.logoPublicId);

  await revalidateEventCacheById(eventId);

  return NextResponse.json({ message: "Sponsor deleted" });
}
