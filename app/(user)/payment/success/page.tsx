import PaymentSuccessClient from "./PaymentSuccessClient";

interface Props {
  searchParams: {
    order_id?: string;
  };
}

export default function PaymentSuccessPage({ searchParams }: Props) {
  const orderId = searchParams.order_id ?? null;

  return <PaymentSuccessClient orderId={orderId} />;
}