"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import GoogleButton from "../../auth/component/GoogleButton";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";
import { useState } from "react";
import { LuEye, LuEyeClosed } from "react-icons/lu";
interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export default function LoginForm({
  onSubmit,
  isLoading = false,
  error,
  className,
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className} noValidate>
      <div className="space-y-5">
        {/* ERROR */}
        {error && (
          <p className="rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2">
            {error}
          </p>
        )}

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 pr-12 ${
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
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="text-right">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700
                     text-white py-3 rounded-xl font-semibold
                     disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in..." : "Login"}
        </button>
        <GoogleButton />
      </div>
    </form>
  );
}
