"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function GoogleButton({
  callbackUrl = "/",
}: {
  callbackUrl?: string;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        signIn("google", { callbackUrl });
      }}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
    >
      <FcGoogle size={20} />
      {loading ? "Connecting..." : "Continue with Google"}
    </button>
  );
}
