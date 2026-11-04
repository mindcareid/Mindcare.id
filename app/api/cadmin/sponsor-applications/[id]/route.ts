import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminGuard";
import { updateSponsorStatusSchema } from "@/lib/validations/sponsor";
import {
  findSponsorApplication,
  normalizeBenefits,
  updateSponsorApplicationStatus,
} from "@/lib/sponsors/queries";

type Params = { params: { id: string } };

function readId(params: Params["params"]): number | null {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const id = readId(params);
  if (!id) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const application = await findSponsorApplication(id);
  if (!application) {
    return NextResponse.json(
      { message: "Application not found" },
      { status: 404 },
    );
  }

  const country = await prismaCountryName(application.countryCode);

  // Benefit yang DISETUJUI sponsor, bukan benefit paket saat ini: admin boleh
  // mengedit paket setelah pengajuan masuk, dan pengajuan lama harus tetap
  // menampilkan isi yang waktu itu diajukan. Baris lama (sebelum ada snapshot)
  // memakai benefit paket sebagai cadangan.
  const agreedBenefits =
    application.benefitsSnapshot !== null
      ? normalizeBenefits(application.benefitsSnapshot)
      : normalizeBenefits(application.tier.benefits);

  return NextResponse.json({
    data: {
      ...application,
      countryName: country,
      tier: {
        ...application.tier,
        benefits: normalizeBenefits(application.tier.benefits),
      },
      agreedBenefits,
      benefitsAreSnapshot: application.benefitsSnapshot !== null,
    },
  });
}

async function prismaCountryName(code: string): Promise<string> {
  const row = await prisma.country.findUnique({
    where: { code },
    select: { name: true },
  });
  return row?.name ?? code;
}

export async function PATCH(req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const id = readId(params);
  if (!id) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = updateSponsorStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed",
        errors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 422 },
    );
  }

  // Tidak lagi mengambil detail lengkap (+ join tier) hanya untuk mengecek
  // keberadaan baris. Kalau id tidak ada, Prisma melempar P2025 dan kita
  // menerjemahkannya menjadi 404.
  try {
    const updated = await updateSponsorApplicationStatus(id, parsed.data.status);
    return NextResponse.json({ message: "Status updated", data: updated });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 },
      );
    }
    throw error;
  }
}
