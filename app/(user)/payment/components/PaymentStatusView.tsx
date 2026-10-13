"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { Blob } from "@/app/components/reusable/Ornaments";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { shortOrderId } from "@/lib/orders";

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "EXPIRED"
  | "CANCELED"
  | "FAILED"
  | "REFUNDED";

type ViewState =
  | { kind: "loading" }
  | { kind: "result"; status: OrderStatus; invoiceUrl: string | null }
  | { kind: "not-found" }
  | { kind: "error"; message: string };

type Tone = "waiting" | "success" | "problem";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 100;

const toneStyles: Record<
  Tone,
  { wrapper: string; icon: string }
> = {
  waiting: { wrapper: "bg-primary/10", icon: "text-primary" },
  success: { wrapper: "bg-accent/10", icon: "text-accent" },
  problem: { wrapper: "bg-destructive/10", icon: "text-destructive" },
};

export default function PaymentStatusView({
  orderId,
}: {
  orderId: string | null;
}) {
  const [state, setState] = useState<ViewState>(
    orderId ? { kind: "loading" } : { kind: "not-found" },
  );
  const [attempt, setAttempt] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const triesRef = useRef(0);

  const retry = useCallback(() => {
    setState({ kind: "loading" });
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;
    triesRef.current = 0;

    const stop = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const poll = async () => {
      triesRef.current += 1;

      try {
        const res = await fetch(
          `/api/transaction?order_id=${encodeURIComponent(orderId)}`,
          { cache: "no-store" },
        );

        if (res.status === 404) {
          if (!cancelled) {
            stop();
            setState({ kind: "not-found" });
          }
          return;
        }

        if (!res.ok) {
          throw new Error(
            "We could not reach the payment service. Check your connection and try again.",
          );
        }

        const data = (await res.json()) as {
          status?: OrderStatus;
          invoiceUrl?: string | null;
        };

        if (cancelled) return;

        const status = data.status ?? "PENDING";
        setState({
          kind: "result",
          status,
          invoiceUrl: data.invoiceUrl ?? null,
        });

        if (status !== "PENDING" || triesRef.current >= MAX_POLLS) {
          stop();
        }
      } catch (err) {
        if (cancelled) return;
        stop();
        setState({
          kind: "error",
          message:
            err instanceof Error
              ? err.message
              : "Something went wrong while checking your payment.",
        });
      }
    };

    poll();
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      stop();
    };
  }, [orderId, attempt]);

  const orderRef = orderId ? shortOrderId(orderId) : null;

  /* ============ not found ============ */
  if (state.kind === "not-found") {
    return (
      <Shell>
        <StatusHead
          tone="problem"
          Icon={XCircle}
          title="We could not find this order"
          description="The link may be incomplete or the order no longer exists. Open your orders to check the latest status."
        />
        {orderRef && <OrderRef value={orderRef} />}
        <Actions>
          <ActionLink href="/dashboard/orders" variant="primary">
            View my orders
          </ActionLink>
          <ActionLink href="/events" variant="outline">
            Browse events
          </ActionLink>
        </Actions>
      </Shell>
    );
  }

  /* ============ error ============ */
  if (state.kind === "error") {
    return (
      <Shell>
        <StatusHead
          tone="problem"
          Icon={XCircle}
          title="We could not confirm your payment"
          description={state.message}
        />
        {orderRef && <OrderRef value={orderRef} />}
        <Actions>
          <ActionButton onClick={retry}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </ActionButton>
          <ActionLink href="/dashboard/orders" variant="outline">
            View my orders
          </ActionLink>
        </Actions>
      </Shell>
    );
  }

  /* ============ loading ============ */
  if (state.kind === "loading") {
    return (
      <Shell>
        <StatusHead
          tone="waiting"
          Icon={Loader2}
          spin
          title="Checking your payment"
          description="This usually takes a few seconds. Keep this page open while we confirm with the payment provider."
        />
        {orderRef && <OrderRef value={orderRef} />}
      </Shell>
    );
  }

  /* ============ paid ============ */
  if (state.status === "PAID") {
    return (
      <Shell>
        <StatusHead
          tone="success"
          Icon={CheckCircle2}
          title="Payment received"
          description="Your tickets are ready. We have sent the e-ticket with its QR code to your email."
        />
        {orderRef && <OrderRef value={orderRef} />}
        <Actions>
          <ActionLink href="/dashboard/my-ticket" variant="primary">
            View my tickets
          </ActionLink>
          <ActionLink href="/events" variant="outline">
            Browse more events
          </ActionLink>
        </Actions>
      </Shell>
    );
  }

  /* ============ expired ============ */
  if (state.status === "EXPIRED" || state.status === "CANCELED") {
    const canceled = state.status === "CANCELED";

    return (
      <Shell>
        <StatusHead
          tone="problem"
          Icon={XCircle}
          title={canceled ? "Payment canceled" : "This invoice expired"}
          description={
            canceled
              ? "This payment was canceled, so the seat was released. You can register again any time."
              : "The payment window closed and the seat was released. Register again to hold a new seat."
          }
        />
        {orderRef && <OrderRef value={orderRef} />}
        <Actions>
          <ActionLink href="/events" variant="primary">
            Register again
          </ActionLink>
          <ActionLink href="/dashboard/orders" variant="outline">
            View my orders
          </ActionLink>
        </Actions>
      </Shell>
    );
  }

  /* ============ failed ============ */
  if (state.status === "FAILED" || state.status === "REFUNDED") {
    return (
      <Shell>
        <StatusHead
          tone="problem"
          Icon={XCircle}
          title={
            state.status === "REFUNDED"
              ? "Payment refunded"
              : "Payment could not be completed"
          }
          description={
            state.status === "REFUNDED"
              ? "This payment was refunded. It may take a few days to appear on your statement."
              : "The payment did not go through, so no ticket was issued. You can register again."
          }
        />
        {orderRef && <OrderRef value={orderRef} />}
        <Actions>
          <ActionLink href="/events" variant="primary">
            Register again
          </ActionLink>
          <ActionLink href="/dashboard/orders" variant="outline">
            View my orders
          </ActionLink>
        </Actions>
      </Shell>
    );
  }

  /* ============ pending (default) ============ */
  return (
    <Shell>
      <StatusHead
        tone="waiting"
        Icon={Clock3}
        title="Payment pending"
        description="Your invoice is still active. Complete the payment to lock in your seat, or come back to this page any time."
      />
      {orderRef && <OrderRef value={orderRef} />}
      <Actions>
        {state.invoiceUrl ? (
          <a
            href={state.invoiceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className={buttonStyles({ size: "lg", className: "w-full" })}
          >
            Complete payment
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : (
          <ActionLink href="/dashboard/orders" variant="primary">
            View my orders
          </ActionLink>
        )}
        <ActionLink href="/dashboard/orders" variant="outline">
          View my orders
        </ActionLink>
      </Actions>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-background px-4 py-12 sm:py-16">
      <Blob
        tone="mint"
        className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2"
      />

      <div
        role="status"
        aria-live="polite"
        className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-card sm:p-8"
      >
        {children}
      </div>
    </main>
  );
}

function StatusHead({
  tone,
  Icon,
  title,
  description,
  spin = false,
}: {
  tone: Tone;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  spin?: boolean;
}) {
  const styles = toneStyles[tone];

  return (
    <>
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${styles.wrapper}`}
      >
        <Icon
          className={`h-8 w-8 ${styles.icon} ${spin ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
      </div>

      <h1 className="mt-5 font-heading text-xl font-semibold tracking-[-0.01em] text-foreground sm:text-2xl">
        {title}
      </h1>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
    </>
  );
}

function OrderRef({ value }: { value: string }) {
  return (
    <p className="mt-4 text-xs font-medium tracking-wide text-muted-foreground">
      Order #{value}
    </p>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex flex-col gap-3">{children}</div>;
}

function ActionLink({
  href,
  variant,
  children,
}: {
  href: string;
  variant: "primary" | "outline";
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={buttonStyles({ variant, size: "lg", className: "w-full" })}
    >
      {children}
    </Link>
  );
}

function ActionButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={buttonStyles({ size: "lg", className: "w-full" })}
    >
      {children}
    </button>
  );
}
