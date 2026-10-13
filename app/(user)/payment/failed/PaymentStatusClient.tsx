"use client";

import PaymentStatusView from "../components/PaymentStatusView";

export default function PaymentStatusClient({ orderId }: { orderId: string }) {
  return <PaymentStatusView orderId={orderId} />;
}
