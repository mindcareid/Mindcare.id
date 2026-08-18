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
interface RegisterFormProps {
  className?: string;
}

export default function RegisterForm({ className }: RegisterFormProps) {
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
      router.push("/auth/login?registered=true");
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            {...register("name")}
            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className={`phone-input w-full  ${
                  errors.phoneNumber ? "phone-error" : ""
                }`}
              />
            )}
          />

          {errors.phoneNumber && (
            <p className="text-sm text-red-600 mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition pr-12 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <LuEyeClosed size={20} /> : <LuEye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">
              {errors.password.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Minimum 8 characters, 1 uppercase & 1 special character
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirmPass ? "text" : "password"}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition pr-12 ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="••••••••"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {isConfirmTouched &&
                (isPasswordMatch ? (
                  <FaRegCheckCircle size={18} className="text-green-500" />
                ) : (
                  <GoXCircleFill size={18} className="text-red-400" />
                ))}
              <button
                type="button"
                onClick={() => setShowConfirmPass((prev) => !prev)}
                className="text-gray-400 hover:text-gray-600 transition"
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
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98]
                 text-white py-3 rounded-xl font-semibold transition
                 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
        <GoogleButton />
      </div>
    </form>
  );
}
