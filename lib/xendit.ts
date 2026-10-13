//invoice xendit
export async function createXenditInvoice({
  orderId,
  amount,
  description,
  idempotencyKey,
}: {
  orderId: string;
  amount: number;
  description: string;
  idempotencyKey?: string;
}) {
  const headers: Record<string, string> = {
    Authorization:
      "Basic " +
      Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString("base64"),
    "Content-Type": "application/json",
  };

  const forUserId = process.env.XENDIT_FOR_USER_ID?.trim();
  if (forUserId) {
    headers["for-user-id"] = forUserId;
  }
  if (idempotencyKey) {
    headers["Idempotency-key"] = idempotencyKey;
  }
  const ttlMinutes = Number(process.env.ORDER_PENDING_TTL_MINUTES ?? "30");
  const invoiceDuration =
    Number.isFinite(ttlMinutes) && ttlMinutes > 0
      ? Math.round(ttlMinutes * 60)
      : undefined;

  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers,
    body: JSON.stringify({
      external_id: orderId,
      amount,
      currency: "IDR",
      description,
      ...(invoiceDuration ? { invoice_duration: invoiceDuration } : {}),
      success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/status?order_id=${orderId}`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/status?order_id=${orderId}`,
    }),
  });

  const invoice = await response.json();

  if (!response.ok) {
    console.error("Xendit Error:", invoice);
    throw new Error(invoice.message || "Failed to create Xendit invoice");
  }

  return {
    id: invoice.id,
    invoiceUrl: invoice.invoice_url,
    status: invoice.status,
  };
}
export async function expireXenditInvoice(invoiceId: string): Promise<void> {
  const headers: Record<string, string> = {
    Authorization:
      "Basic " +
      Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString("base64"),
    "Content-Type": "application/json",
  };

  const forUserId = process.env.XENDIT_FOR_USER_ID?.trim();
  if (forUserId) {
    headers["for-user-id"] = forUserId;
  }

  const response = await fetch(
    `https://api.xendit.co/invoices/${encodeURIComponent(invoiceId)}/expire`,
    {
      method: "POST",
      headers,
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to expire Xendit invoice ${invoiceId} (${response.status}): ${errorBody}`,
    );
  }
}
