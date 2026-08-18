"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TransactionStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELED";

interface Props {
  orderId: string | null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

export default function PaymentSuccessClient({ orderId }: Props) {
  const [status, setStatus] = useState<TransactionStatus>("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID not found");
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `/api/transaction?order_id=${orderId}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch payment status");
        }

        const data: { status: TransactionStatus } = await res.json();

        setStatus(data.status);

        if (data.status === "PAID" || data.status === "EXPIRED" ) {
          stopPolling();
          setLoading(false);
        }
      } catch (err) {
        setError(getErrorMessage(err));
        stopPolling();
        setLoading(false);
      }
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 3000);

    return stopPolling;
  }, [orderId]);

  /* ================= ERROR ================= */
  if (error) {
    return (
      <StatusLayout>
        <XCircle className="mx-auto text-red-600" size={64} />
        <h1 className="text-xl font-bold mt-4 text-red-600">
          Something Went Wrong
        </h1>
        <p className="text-gray-600 mt-2">{error}</p>

        <Link href="/" className="btn-primary mt-6">
          Back to Home
        </Link>
      </StatusLayout>
    );
  }

  /* ================= LOADING / PENDING ================= */
  if (loading || status === "PENDING") {
    return (
      <StatusLayout>
        <Loader2 className="mx-auto animate-spin text-green-600" size={64} />
        <h1 className="text-xl font-semibold mt-4">
          Waiting for Payment Confirmation
        </h1>
        <p className="text-gray-600 mt-2">
          Please do not close this page.
        </p>
      </StatusLayout>
    );
  }

  /* ================= EXPIRED ================= */
  if (status === "EXPIRED") {
    return (
      <StatusLayout>
        <XCircle className="mx-auto text-red-600" size={64} />
        <h1 className="text-xl font-bold mt-4">
          Payment Expired
        </h1>
        <p className="text-gray-600 mt-2">
          Please try again.
        </p>

        <Link href="/" className="btn-primary mt-6">
          Back to Home
        </Link>
      </StatusLayout>
    );
  }

  /* ================= PAID ================= */
  return (
    <StatusLayout>
      <CheckCircle2 className="mx-auto text-green-600" size={64} />
      <h1 className="text-2xl font-bold mt-4">
        Payment Successful 🎉
      </h1>
      <p className="text-gray-600 mt-2">
        Your ticket is ready to use.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <Link href="/dashboard/my-ticket" className="btn-primary">
          View My Ticket
        </Link>

        <Link href="/" className="text-green-600 hover:underline">
          Back to Home
        </Link>
      </div>
    </StatusLayout>
  );
}

/* ================= LAYOUT ================= */

function StatusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6 text-center">
        {children}
      </div>
    </div>
  );
}