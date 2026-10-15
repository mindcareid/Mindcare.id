"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/lib/validations/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LuCheck } from "react-icons/lu";

interface ForgotPasswordFormProps {
  className?: string;
}

export default function ForgotPasswordForm({
  className,
}: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success("Reset link sent!", {
        description: "Check your email for the reset link.",
      });
      reset();
      setEmailSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-5">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-emerald-600/10 flex items-center justify-center">
          <LuCheck className="w-8 h-8 text-brand-emerald-600" />
        </div>

        <h3 className="text-xl font-semibold text-foreground">
          Check Your Email
        </h3>
        <p className="text-muted-foreground">
          If an account exists for{" "}
          <span className="font-medium text-foreground">
            {getValues("email")}
          </span>
          , you will receive a password reset link shortly.
        </p>

        <div className="pt-2 space-y-3">
          <Link
            href="/auth/login"
            className="block w-full bg-brand-navy-700 hover:bg-brand-navy-800 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Back to Login
          </Link>
          <button
            onClick={() => setEmailSent(false)}
            className="text-sm text-brand-purple-600 hover:text-brand-purple-700 transition-colors font-medium"
          >
            Did not receive the email? Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      <div className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={cn(
              "w-full px-4 py-3 rounded-xl border border-border bg-card transition-all duration-200",
              "placeholder:text-muted-foreground/60",
              "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring",
              errors.email && "border-destructive focus:ring-destructive/30 focus:border-destructive",
            )}
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-destructive">{errors.email.message}</p>
          )}
          <p className="mt-1.5 text-xs text-muted-foreground">
            We will send you a link to reset your password
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-navy-700 hover:bg-brand-navy-800 active:scale-[0.98] text-white py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Sending...</span>
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </div>
    </form>
  );
}
