import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { sendProposalEmail } from "@/lib/mail";
import { mailConfig } from "@/lib/mail/config";
import { loadProposalDocument } from "@/lib/events/proposal";
import { verifyCaptcha } from "@/lib/captcha";
import { proposalDownloadSchema } from "@/lib/validations/proposal";

const RESEND_COOLDOWN_MS = 10 * 60 * 1000;
const RECAPTCHA_ACTION = "proposal_download";
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const eventId = Number(params.id);

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return NextResponse.json({ message: "Invalid eventId" }, { status: 400 });
  }

  const clientIp = getClientIp(req);
  const ipLimit = rateLimit(`proposal-download:${clientIp}`, 5, 60_000);

  if (!ipLimit.ok) {
    return NextResponse.json(
      { message: "Too many requests. Please try again shortly." },
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

  const parsed = proposalDownloadSchema.safeParse(body);

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
    const proposal = await loadProposalDocument(eventId);

    if (!proposal) {
      return NextResponse.json(
        { message: "Proposal is not available for this event" },
        { status: 404 },
      );
    }
    const storedEventName = proposal.event.eventTitle.slice(0, 255);

    const recent = await prisma.eventProposalDownload.findFirst({
      where: {
        eventId,
        email: input.email,
        createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) },
      },
      select: { id: true },
    });

    if (recent) {
      return NextResponse.json(
        {
          code: "ALREADY_SENT",
          message:
            "We just sent this proposal to that email address. Please check your inbox (and spam folder).",
        },
        { status: 429 },
      );
    }

    const lead = await prisma.eventProposalDownload.create({
      data: {
        eventId,
        eventName: storedEventName,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        institution: input.institution,
        position: input.position,
        source: proposal.document.source,
        documentWarning: proposal.document.warning,
        status: "PENDING",
        ip: clientIp === "unknown" ? null : clientIp,
        userAgent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
      },
      select: { id: true },
    });

    try {
      await sendProposalEmail(
        {
          to: input.email,
          fullName: input.fullName,
          eventTitle: proposal.event.eventTitle,
          fileName: proposal.document.fileName,
          date: proposal.event.date,
          time: proposal.event.time,
          location: proposal.event.location,
          eventUrl: mailConfig.appUrl,
        },
        proposal.document.buffer,
      );
    } catch (error) {
      console.error("[PROPOSAL_EMAIL_ERROR]", error);

      await prisma.eventProposalDownload
        .update({
          where: { id: lead.id },
          data: {
            status: "FAILED",
            emailError:
              error instanceof Error
                ? error.message.slice(0, 500)
                : "Unknown email error",
          },
        })
        .catch(() => undefined);

      return NextResponse.json(
        {
          message:
            "We could not send the email right now. Please try again in a few minutes.",
        },
        { status: 502 },
      );
    }

    await prisma.eventProposalDownload.update({
      where: { id: lead.id },
      data: { status: "CONFIRMED", emailSentAt: new Date(), emailError: null },
    });

    return NextResponse.json({
      success: true,
      message: "The proposal has been sent to your email.",
    });
  } catch (error) {
    console.error("[PROPOSAL_DOWNLOAD_ERROR]", error);
    return NextResponse.json(
      { message: "Failed to send the proposal" },
      { status: 500 },
    );
  }
}
