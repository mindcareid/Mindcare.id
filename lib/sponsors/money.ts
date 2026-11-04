export function formatIdr(amount: number): string {
  return `IDR ${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function formatUsd(amount: number): string {
  return `US$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function priceLines({
  amount,
  currency,
  displayUsd,
}: {
  amount: number;
  currency: string;
  displayUsd?: number | null;
}): { primary: string; secondary: string | null } {
  const primary =
    currency === "IDR" ? formatIdr(amount) : `${currency} ${amount}`;

  return {
    primary,
    secondary:
      currency === "IDR" && displayUsd && displayUsd > 0
        ? `≈ ${formatUsd(displayUsd)}`
        : null,
  };
}
