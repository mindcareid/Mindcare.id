//invoice xendit
export async function createXenditInvoice({
  orderId,
  amount,
  description,
}: {
  orderId: string;
  amount: number;
  description: string;
}) {
  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString("base64"),
      "Content-Type": "application/json",
      "for-user-id": process.env.XENDIT_FOR_USER_ID!,
    },
    body: JSON.stringify({
      external_id: orderId,
      amount,
      currency: "IDR",
      description,
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
