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
      className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-60"
    >
      <FcGoogle size={20} />
      {loading ? "Connecting..." : "Continue with Google"}
    </button>
  );
}
