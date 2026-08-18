"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
//import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertTriangle,
} from "lucide-react";

type TransactionStatus =
  | "PENDING"
  | "PAID"
  | "EXPIRED"
  | "NOT_FOUND";

interface Props {
  orderId: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export default function PaymentStatusClient({
  orderId,
}: Props) {
  //const router = useRouter();

  const [status, setStatus] =
    useState<TransactionStatus>("PENDING");

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(
    null
  );

  const retryRef = useRef(0);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID not found");
      setLoading(false);
      return;
    }

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const fetchStatus = async () => {
      try {
        retryRef.current++;

        const res = await fetch(
          `/api/transaction?order_id=${orderId}`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch payment status");
        }

        const data = await res.json();

        if (res.status === 404) {
            setStatus("NOT_FOUND");
            stopPolling();
            setLoading(false);
            return;
        }

        if (!res.ok) {
            throw new Error(data.message ?? "Failed to fetch payment status");
        }

        setStatus(data.status);

        if (
          data.status === "PAID" ||
          data.status === "EXPIRED"
        ) {
          stopPolling();
          setLoading(false);
          return;
        }

        if (retryRef.current >= 100) {
          stopPolling();
          setLoading(false);
        }
      } catch (err) {
        stopPolling();
        setLoading(false);
        setError(getErrorMessage(err));
      }
    };

    fetchStatus();

    intervalRef.current = setInterval(
      fetchStatus,
      3000
    );

    return stopPolling;
  }, [orderId]);

  /* ================= ERROR ================= */

  if (error) {
    return (
      <StatusLayout>
        <AlertTriangle
          className="mx-auto text-red-600"
          size={70}
        />

        <h1 className="mt-4 text-2xl font-bold">
          Something went wrong
        </h1>

        <p className="mt-3 text-gray-600">
          {error}
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex rounded-lg bg-red-600 px-5 py-3 text-white hover:bg-red-700"
        >
          Back to Home
        </Link>
      </StatusLayout>
    );
  }

  /* ================= LOADING ================= */

  if (loading && status === "PENDING") {
    return (
      <StatusLayout>
        <Loader2
          className="mx-auto animate-spin text-blue-600"
          size={70}
        />

        <h1 className="mt-5 text-2xl font-bold">
          Waiting for Payment
        </h1>

        <p className="mt-3 text-gray-600">
          We are waiting for payment confirmation.
          <br />
          Please don&apos;t close this page.
        </p>
      </StatusLayout>
    );
  }

  /* ================= PENDING ================= */

  if (status === "PENDING") {
    return (
      <StatusLayout>
        <Clock3
          className="mx-auto text-yellow-500"
          size={70}
        />

        <h1 className="mt-5 text-2xl font-bold">
          Payment Pending
        </h1>

        <p className="mt-3 text-gray-600">
          Your invoice is still active.
          <br />
          Please complete your payment.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className="rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </StatusLayout>
    );
  }

  /* ================= SUCCESS ================= */

  if (status === "PAID") {
    return (
      <StatusLayout>
        <CheckCircle2
          className="mx-auto text-green-600"
          size={70}
        />

        <h1 className="mt-5 text-3xl font-bold">
          Payment Successful 🎉
        </h1>

        <p className="mt-3 text-gray-600">
          Your payment has been received.
          <br />
          Your ticket is ready.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/dashboard/my-ticket"
            className="rounded-lg bg-green-600 py-3 text-white hover:bg-green-700"
          >
            View My Ticket
          </Link>

          <Link
            href="/"
            className="text-green-700 hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </StatusLayout>
    );
  }

  /* ================= EXPIRED ================= */

  if (status === "EXPIRED") {
    return (
      <StatusLayout>
        <XCircle
          className="mx-auto text-red-600"
          size={70}
        />

        <h1 className="mt-5 text-3xl font-bold">
          Payment Expired
        </h1>

        <p className="mt-3 text-gray-600">
          Your invoice has expired.
          <br />
          Please create a new order.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/events"
            className="rounded-lg bg-red-600 py-3 text-white hover:bg-red-700"
          >
            Buy Again
          </Link>

          <Link
            href="/"
            className="text-red-700 hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </StatusLayout>
    );
  }


  if (status === "NOT_FOUND") {
  return (
    <StatusLayout>
      <AlertTriangle
        className="mx-auto text-yellow-500"
        size={70}
      />

      <h1 className="mt-5 text-3xl font-bold">
        Payment Not Found
      </h1>

      <p className="mt-3 text-gray-600">
        We couldn&apos;t find this payment.
        <br />
        It may have been deleted or the payment link is invalid.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/events"
          className="rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
        >
          Browse Events
        </Link>

        <Link
          href="/"
          className="text-blue-600 hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </StatusLayout>
  );
}

  return (
    <StatusLayout>
      <XCircle
        className="mx-auto text-red-600"
        size={70}
      />

      <h1 className="mt-5 text-3xl font-bold">
        Payment Failed
      </h1>

      <p className="mt-3 text-gray-600">
        Your payment could not be completed.
        <br />
        Please try again.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/events"
          className="rounded-lg bg-red-600 py-3 text-white hover:bg-red-700"
        >
          Try Again
        </Link>

        <Link
          href="/"
          className="text-red-700 hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </StatusLayout>
  );
}

function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        {children}
      </div>
    </div>
  );
}