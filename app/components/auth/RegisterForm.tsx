"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, RegisterFormData } from "@/lib/validations/auth";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import TermsUser from "../../auth/component/TermsUser";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import { FaRegCheckCircle } from "react-icons/fa";
import { GoXCircleFill } from "react-icons/go";
import GoogleButton from "../../auth/component/GoogleButton";
import { cn } from "@/lib/utils";

interface RegisterFormProps {
  className?: string;
  callbackUrl?: string | null;
}

export default function RegisterForm({
  className,
  callbackUrl,
}: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

  const isConfirmTouched = confirmPasswordValue?.length > 0;
  const isPasswordMatch = passwordValue === confirmPasswordValue;

  const inputClasses = (hasError?: boolean) =>
    cn(
      "w-full px-4 py-3 rounded-xl border border-border bg-card transition-all duration-200",
      "placeholder:text-muted-foreground/60",
      "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring",
      hasError && "border-destructive focus:ring-destructive/30 focus:border-destructive",
    );

  const onSubmit = async (data: RegisterFormData) => {
    if (!agree) {
      toast.info("Please agree to the terms & conditions.", {
        description:
          "You must agree to the terms and conditions before registering",
      });
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Registration failed");
      }

      toast.success("Registration Success", {
        description: "Please login using your account",
      });

      reset();
      const next = new URLSearchParams({ registered: "true" });
      if (callbackUrl) next.set("callbackUrl", callbackUrl);
      router.push(`/auth/login?${next.toString()}`);
    } catch (err) {
      toast.error("Registration Failed", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name
          </label>
          <input
            {...register("name")}
            className={inputClasses(!!errors.name)}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1.5">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            className={inputClasses(!!errors.email)}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number
          </label>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <PhoneInput
                {...field}
                international
                defaultCountry="ID"
                className={cn("phone-input w-full", errors.phoneNumber && "phone-error")}
              />
            )}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-destructive mt-1.5">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className={cn(
                inputClasses(!!errors.password),
                "pr-12",
              )}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <LuEyeClosed size={20} /> : <LuEye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive mt-1.5">
              {errors.password.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1.5">
            Minimum 8 characters, 1 uppercase & 1 special character
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirmPass ? "text" : "password"}
              className={cn(
                inputClasses(!!errors.confirmPassword),
                "pr-12",
              )}
              placeholder="••••••••"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {isConfirmTouched &&
                (isPasswordMatch ? (
                  <FaRegCheckCircle size={18} className="text-green-500" />
                ) : (
                  <GoXCircleFill size={18} className="text-red-400" />
                ))}
              <button
                type="button"
                onClick={() => setShowConfirmPass((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirmPass ? "Hide password" : "Show password"}
              >
                {showConfirmPass ? (
                  <LuEyeClosed size={20} />
                ) : (
                  <LuEye size={20} />
                )}
              </button>
            </div>
          </div>
        </div>

        <TermsUser checked={agree} onChange={setAgree} />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-navy-700 hover:bg-brand-navy-800 active:scale-[0.98] text-white py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">or continue with</span>
          </div>
        </div>

        <GoogleButton />
      </div>
    </form>
  );
}
