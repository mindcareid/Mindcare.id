import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminGuard";
import { sponsorTierSchema } from "@/lib/validations/sponsor";
import { listAdminSponsorTiers } from "@/lib/sponsors/queries";
import { revalidateEventCacheById } from "@/lib/events/cache";

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

export async function GET(_req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const eventId = readEventId(params);
  if (!eventId) {
    return NextResponse.json({ message: "Invalid event id" }, { status: 400 });
  }

  const event = await ensurePlatformEvent(eventId);
  if (!event) {
    return NextResponse.json(
      {
        message:
          "Sponsorship packages are only available for MindCare platform events",
      },
      { status: 404 },
    );
  }

  const tiers = await listAdminSponsorTiers(eventId);

  return NextResponse.json({ event, data: tiers });
}

export async function POST(req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const eventId = readEventId(params);
  if (!eventId) {
    return NextResponse.json({ message: "Invalid event id" }, { status: 400 });
  }

  const event = await ensurePlatformEvent(eventId);
  if (!event) {
    return NextResponse.json(
      {
        message:
          "Sponsorship packages are only available for MindCare platform events",
      },
      { status: 404 },
    );
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = sponsorTierSchema.safeParse(body);
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

  const created = await prisma.eventSponsorTier.create({
    data: {
      eventId,
      name: data.name,
      priceAmount: data.priceAmount,
      currency: "IDR",
      displayUsd: data.displayUsd ?? null,
      fxRateUsed: data.fxRateUsed ?? null,
      benefits: data.benefits,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
    select: { id: true, name: true },
  });

  await revalidateEventCacheById(eventId);

  return NextResponse.json(
    { message: "Package created", data: created },
    { status: 201 },
  );
}

export async function PATCH(req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const eventId = readEventId(params);
  const tierId = Number(new URL(req.url).searchParams.get("tierId"));

  if (!eventId || !Number.isInteger(tierId) || tierId <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const existing = await prisma.eventSponsorTier.findFirst({
    where: { id: tierId, eventId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ message: "Package not found" }, { status: 404 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = sponsorTierSchema.safeParse(body);
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

  const updated = await prisma.eventSponsorTier.update({
    where: { id: tierId },
    data: {
      name: data.name,
      priceAmount: data.priceAmount,
      displayUsd: data.displayUsd ?? null,
      fxRateUsed: data.fxRateUsed ?? null,
      benefits: data.benefits,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
    select: { id: true, name: true },
  });

  await revalidateEventCacheById(eventId);

  return NextResponse.json({ message: "Package updated", data: updated });
}

export async function DELETE(req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const eventId = readEventId(params);
  const tierId = Number(new URL(req.url).searchParams.get("tierId"));

  if (!eventId || !Number.isInteger(tierId) || tierId <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const existing = await prisma.eventSponsorTier.findFirst({
    where: { id: tierId, eventId },
    select: { id: true, name: true },
  });
  if (!existing) {
    return NextResponse.json({ message: "Package not found" }, { status: 404 });
  }

  // Paket yang sudah pernah diajukan TIDAK boleh dihapus: pengajuan lama harus
  // tetap punya nama & harga paketnya. Database juga menolak lewat
  // `onDelete: Restrict`; cek di sini supaya pesannya bisa dibaca admin.
  const used = await prisma.eventSponsorApplication.count({
    where: { tierId },
  });
  if (used > 0) {
    return NextResponse.json(
      {
        message: `Cannot delete: ${used} application${
          used > 1 ? "s" : ""
        } already use this package. Turn it off instead.`,
        code: "TIER_IN_USE",
      },
      { status: 409 },
    );
  }

  await prisma.eventSponsorTier.delete({ where: { id: tierId } });

  await revalidateEventCacheById(eventId);

  return NextResponse.json({ message: "Package deleted" });
}
