const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

const VERIFY_TIMEOUT_MS = 10_000;

const MIN_SCORE = Number(process.env.RECAPTCHA_MIN_SCORE ?? "0.5");

export function isCaptchaConfigured(): boolean {
  return Boolean(
    process.env.RECAPTCHA_SECRET_KEY &&
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  );
}

export type CaptchaResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "invalid" | "low_score" | "error" };

export async function verifyCaptcha(
  token: string | undefined,
  expectedAction: string,
  remoteIp?: string,
): Promise<CaptchaResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[RECAPTCHA] RECAPTCHA_SECRET_KEY belum diset — request ditolak",
      );
      return { ok: false, reason: "error" };
    }
    return { ok: true };
  }

  if (!token) {
    return { ok: false, reason: "missing" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp && remoteIp !== "unknown") {
      body.set("remoteip", remoteIp);
    }

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });

    if (!res.ok) {
      return { ok: false, reason: "error" };
    }

    const data = (await res.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
      "error-codes"?: string[];
    };

    if (!data.success) {
      return { ok: false, reason: "invalid" };
    }

    if (data.action !== expectedAction) {
      return { ok: false, reason: "invalid" };
    }
    if (typeof data.score !== "number") {
      console.error(
        "[RECAPTCHA] Respons tanpa score:",
        data["error-codes"] ?? "no error codes",
      );
      return { ok: false, reason: "error" };
    }

    if (data.score < MIN_SCORE) {
      return { ok: false, reason: "low_score" };
    }

    return { ok: true };
  } catch (error) {
    console.error("[RECAPTCHA_VERIFY_ERROR]", error);
    return { ok: false, reason: "error" };
  } finally {
    clearTimeout(timer);
  }
}
