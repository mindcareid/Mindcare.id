"use client";

import PaymentStatusView from "../components/PaymentStatusView";

export default function PaymentSuccessClient({
  orderId,
}: {
  orderId: string | null;
}) {
  return <PaymentStatusView orderId={orderId} />;
}
