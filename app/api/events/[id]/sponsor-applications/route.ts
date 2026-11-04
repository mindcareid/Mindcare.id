import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { verifyCaptcha } from "@/lib/captcha";
import { runAfterResponse } from "@/lib/afterResponse";
import { sponsorApplicationSchema } from "@/lib/validations/sponsor";
import {
  SPONSOR_PUBLIC_EVENT_WHERE,
  isSponsorshipEnded,
  normalizeBenefits,
  validateCountryAndPhone,
} from "@/lib/sponsors/queries";
import { generateSponsorReferenceNo } from "@/lib/sponsors/reference";
import { sendSponsorApplicationEmail } from "@/lib/mail";
import { mailConfig } from "@/lib/mail/config";
import {
  formatDate,
  formatTimeOnly,
  getTimeZoneLabel,
} from "@/lib/utils/FormatDate";
import { PdfService } from "@/lib/pdf";

const RECAPTCHA_ACTION = "sponsor_application";
const IP_LIMIT = 5;
const IP_WINDOW_MS = 10 * 60 * 1000;
const EMAIL_LIMIT = 3;
const EMAIL_WINDOW_MS = 10 * 60 * 1000;

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const eventId = Number(params.id);

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return NextResponse.json({ message: "Invalid event id" }, { status: 400 });
  }

  const clientIp = getClientIp(req);

  const ipLimit = rateLimit(
    `sponsor-apply:${clientIp}`,
    IP_LIMIT,
    IP_WINDOW_MS,
  );
  if (!ipLimit.ok) {
    return NextResponse.json(
      {
        message:
          "Too many applications from this connection. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(Math.ceil((ipLimit.resetAt - Date.now()) / 1000), 1),
          ),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const parsed = sponsorApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed",
        errors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 422 },
    );
  }

  const input = parsed.data;

  if (input.eventId !== eventId) {
    return NextResponse.json(
      { message: "Event does not match the address" },
      { status: 400 },
    );
  }

  /*
   * Kuota per-email TIDAK dihitung di sini, melainkan tepat sebelum baris
   * pengajuan dibuat (lihat di bawah).
   *
   * Alasannya: kalau dihitung di depan, percobaan yang gagal captcha atau
   * memakai paket yang sudah tidak aktif tetap memakan jatah. Setelah tiga
   * percobaan seperti itu, PIC yang sah malah ditolak dengan pesan "we
   * already received applications from this email" — pesan yang tidak benar,
   * karena belum ada satu pengajuan pun yang masuk dari dia.
   *
   * Penahan penyalahgunaan tetap ada: rate limit per IP di atas berjalan
   * duluan, dan captcha wajib lolos sebelum kuota ini dihitung.
   */

  /*
   * Cek negara <-> telepon dijalankan SEBELUM captcha, dan itu disengaja.
   * Ini pengecekan murni (tidak menulis apa pun) yang menolak masukan yang
   * memang tidak mungkin benar: PIC berkantor di Singapura tapi nomornya +62.
   * Kalau ditaruh setelah captcha, orang akan gagal captcha dulu, mengulang,
   * dan baru tahu nomornya salah — tiga putaran untuk satu salah ketik.
   *
   * Bahayanya tidak ada: captcha tetap menjadi gerbang sebelum data ditulis,
   * karena tabel Country hanya 250 baris berindeks primer. Cek yang menulis
   * (pembuatan baris, email) tetap berada setelah captcha.
   */
  const countryCheck = await validateCountryAndPhone({
    countryCode: input.countryCode,
    phone: input.picPhone,
  });
  if (!countryCheck.ok) {
    return NextResponse.json(
      {
        message: "Validation failed",
        errors: { [countryCheck.field]: [countryCheck.message] },
      },
      { status: 422 },
    );
  }

  const captcha = await verifyCaptcha(
    input.captchaToken,
    RECAPTCHA_ACTION,
    clientIp,
  );
  if (!captcha.ok) {
    const message =
      captcha.reason === "low_score"
        ? "We could not verify that you are human. Please refresh the page and try again."
        : "Security check failed. Please refresh the page and try again.";
    return NextResponse.json(
      { code: "CAPTCHA_FAILED", message },
      { status: 403 },
    );
  }

  try {
    const event = await prisma.event.findFirst({
      where: { ...SPONSOR_PUBLIC_EVENT_WHERE, id: eventId },
      select: {
        id: true,
        title: true,
        slug: true,
        startDate: true,
        endDate: true,
        timeZone: true,
        location: true,
        format: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Sponsorship is not open for this event" },
        { status: 404 },
      );
    }

    // Event yang sudah berakhir: halaman publik menyembunyikan section ini,
    // tapi tombol lama/bookmark masih bisa mengirim. Tolak di server, jangan
    // hanya mengandalkan UI. Batas `<=` dipakai lewat helper supaya sama
    // dengan halaman form.
    if (isSponsorshipEnded(event.endDate)) {
      return NextResponse.json(
        { message: "This event has already ended" },
        { status: 409 },
      );
    }

    const tier = await prisma.eventSponsorTier.findFirst({
      where: { id: input.tierId, eventId, isActive: true },
      select: {
        id: true,
        name: true,
        priceAmount: true,
        currency: true,
        displayUsd: true,
        benefits: true,
      },
    });

    if (!tier) {
      return NextResponse.json(
        { message: "That sponsorship package is no longer available" },
        { status: 409 },
      );
    }

    /*
     * Keunikan nomor referensi dijamin `@unique` di database. Kalau dua
     * pengajuan memakai nomor yang sama, INSERT yang kedua gagal dengan P2002;
     * di sini dicoba lagi dengan nomor baru, bukan dikembalikan sebagai 500.
     */
    let application: { id: number; referenceNo: string } | null = null;
    for (let attempt = 0; attempt < 3 && !application; attempt += 1) {
      const referenceNo = await generateSponsorReferenceNo();

      try {
        application = await prisma.eventSponsorApplication.create({
          data: {
            referenceNo,
            eventId,
            tierId: tier.id,
            companyName: input.companyName,
            address: input.address,
            countryCode: input.countryCode,
            website: input.website,
            companyEmail: input.companyEmail,
            picFirstName: input.picFirstName,
            picLastName: input.picLastName,
            picTitle: input.picTitle,
            picPosition: input.picPosition,
            picPhone: input.picPhone,
            picEmail: input.picEmail,
            notes: input.notes,
            // Salinan harga & benefit saat pengajuan dibuat — lihat catatan di
            // schema. Tanpa salinan benefit, panel admin menampilkan janji
            // paket yang mungkin sudah diedit setelah pengajuan ini masuk.
            priceAmountSnapshot: tier.priceAmount,
            currencySnapshot: tier.currency,
            displayUsdSnapshot: tier.displayUsd,
            benefitsSnapshot: normalizeBenefits(tier.benefits),
          },
          select: { id: true, referenceNo: true },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          continue;
        }
        throw error;
      }
    }

    if (!application) {
      throw new Error("Could not allocate a unique sponsor reference number");
    }

    /*
     * Kuota per-email baru dihitung di sini: setelah captcha lolos, setelah
     * event & paket dipastikan sah. Dengan begitu hanya percobaan yang benar-
     * benar akan tersimpan yang memakan jatah, dan pesan "we already received
     * applications from this email" selalu jujur.
     */
    const emailLimit = rateLimit(
      `sponsor-apply-email:${input.picEmail}`,
      EMAIL_LIMIT,
      EMAIL_WINDOW_MS,
    );
    if (!emailLimit.ok) {
      return NextResponse.json(
        {
          message:
            "We already received applications from this email recently. Our team will be in touch.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(Math.ceil((emailLimit.resetAt - Date.now()) / 1000), 1),
            ),
          },
        },
      );
    }

    const tierBenefits = normalizeBenefits(tier.benefits);
    const timeZone = event.timeZone || "Asia/Jakarta";

    const mail = {
      to: input.picEmail,
      referenceNo: application.referenceNo,
      companyName: input.companyName,
      picName: [input.picTitle, input.picFirstName, input.picLastName]
        .filter(Boolean)
        .join(" "),
      eventTitle: event.title,
      eventDate: formatDate(event.startDate, timeZone),
      eventLocation:
        event.location ?? (event.format === "ONLINE" ? "Online" : "-"),
      tierName: tier.name,
      priceAmount: tier.priceAmount,
      currency: tier.currency,
      displayUsd: tier.displayUsd,
      benefits: tierBenefits,
      supportEmail: mailConfig.supportEmail,
    };

    // Email + PDF dikirim setelah respons supaya PIC tidak menunggu render
    // PDF. Kegagalannya dicatat ke baris pengajuan, bukan dilempar ke PIC
    // seolah pengajuannya gagal — barisnya sudah tersimpan.
    runAfterResponse(
      (async () => {
        try {
          const pdf = await PdfService.generateSponsorConfirmation({
            referenceNo: application.referenceNo,
            companyName: input.companyName,
            companyAddress: input.address,
            companyCountry: input.countryCode,
            companyWebsite: input.website,
            companyEmail: input.companyEmail,
            picName: mail.picName,
            picPosition: input.picPosition,
            picPhone: input.picPhone,
            picEmail: input.picEmail,
            notes: input.notes,
            eventTitle: event.title,
            eventDate: mail.eventDate,
            eventTime: `${formatTimeOnly(event.startDate, timeZone)} – ${formatTimeOnly(
              event.endDate,
              timeZone,
            )} ${getTimeZoneLabel(event.startDate, timeZone)}`,
            eventLocation: mail.eventLocation,
            tierName: tier.name,
            priceAmount: tier.priceAmount,
            currency: tier.currency,
            displayUsd: tier.displayUsd,
            benefits: tierBenefits,
            submittedAt: new Date(),
            supportEmail: mailConfig.supportEmail,
          });

          await sendSponsorApplicationEmail(
            mail,
            pdf,
            `sponsor-${application.referenceNo}.pdf`,
          );

          await prisma.eventSponsorApplication.update({
            where: { id: application.id },
            data: { emailSentAt: new Date(), emailError: null },
          });
        } catch (error) {
          console.error("[SPONSOR_APPLICATION_EMAIL_ERROR]", error);
          await prisma.eventSponsorApplication
            .update({
              where: { id: application.id },
              data: {
                emailError:
                  error instanceof Error
                    ? error.message.slice(0, 500)
                    : "Unknown email error",
              },
            })
            .catch(() => undefined);
        }
      })(),
    );

    return NextResponse.json(
      {
        success: true,
        message: "Application received",
        data: { referenceNo: application.referenceNo, email: input.picEmail },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[SPONSOR_APPLICATION_ERROR]", error);
    return NextResponse.json(
      { message: "Could not submit your application. Please try again." },
      { status: 500 },
    );
  }
}
