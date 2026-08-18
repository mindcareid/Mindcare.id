import PaymentStatusClient from "./PaymentStatusClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const params = await searchParams;

  return (
    <PaymentStatusClient
      orderId={params.order_id ?? ""}
    />
  );
}