"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LuEyeClosed, LuEye } from "react-icons/lu";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/lib/validations/auth";
import RuleItem from "@/app/components/RuleItem";
import { cn } from "@/lib/utils";

interface ResetPasswordFormProps {
  className?: string;
}

const inputClasses = (hasError?: boolean) =>
  cn(
    "w-full px-4 py-3 rounded-xl border border-border bg-card transition-all duration-200",
    "placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring",
    hasError && "border-destructive focus:ring-destructive/30 focus:border-destructive",
  );

export default function ResetPasswordForm({
  className,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmpass] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });
  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const passwordRules = {
    minLength: passwordValue.length >= 8,
    uppercase: /[A-Z]/.test(passwordValue),
    lowercase: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    special: /[^A-Za-z0-9]/.test(passwordValue),
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.code === "PASSWORD_REUSED") {
          setError(
            "password",
            { type: "server", message: json.message },
            { shouldFocus: true },
          );
          toast.error(json.message);
          return;
        }

        throw new Error(json.message);
      }

      toast.success("Password reset successfully!");
      reset();
      router.push("/auth/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      <div className="space-y-5">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              className={cn(inputClasses(!!errors.password), "pr-12")}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide Password" : "Show Password"}
            >
              {showPassword ? <LuEyeClosed size={20} /> : <LuEye size={20} />}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1.5 text-sm text-destructive">
              {errors.password.message}
            </p>
          )}

          <div className="text-xs text-muted-foreground bg-muted border border-border rounded-xl p-3 mt-2 space-y-1.5">
            <RuleItem
              valid={passwordRules.minLength}
              label="At least 8 characters including:"
              showIcon={false}
            />
            <RuleItem
              valid={passwordRules.uppercase}
              label="1 uppercase letter"
            />
            <RuleItem
              valid={passwordRules.lowercase}
              label="1 lowercase letter"
            />
            <RuleItem valid={passwordRules.number} label="1 number" />
            <RuleItem
              valid={passwordRules.special}
              label="1 special character (Eg. .,/?'[]{}`!@#$%^&*()_+=-)"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPass ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={cn(inputClasses(!!errors.confirmPassword), "pr-12")}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmpass((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirmPass ? "Hide Password" : "Show Password"}
            >
              {showConfirmPass ? (
                <LuEyeClosed size={20} />
              ) : (
                <LuEye size={20} />
              )}
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="mt-1.5 text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
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
              <span>Resetting...</span>
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </div>
    </form>
  );
}
