"use client";

import RuleItem from "@/app/components/RuleItem";
import {
  changePasswordSchema,
  ChangePasswordFormData,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "sonner";

const PasswordInput = ({
  label,
  register,
  name,
  error,
  placeholder,
}: {
  label: string;
  register: any;
  name: string;
  error?: string;
  placeholder?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <div className="bg-white border rounded-xl px-5 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
            {label}:
          </p>
          <div className="flex-1 relative">
            <input
              {...register(name)}
              type={showPassword ? "text" : "password"}
              className="w-full text-sm font-medium text-gray-900 bg-transparent outline-none pr-8"
              placeholder={placeholder || "Enter password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="w-5 h-5" />
              ) : (
                <AiOutlineEye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 px-2">{error}</p>}
    </div>
  );
};

export default function ChangePassword() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const newPassword = useWatch({
    control,
    name: "newPassword",
    defaultValue: "",
  });

  const passwordRules = {
    minLength: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    console.log("Form data:", data);
    try {
      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      });
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const result = await response.json();

      if (response.ok) {
        toast.success("Password changed successfully. Please login again.");
        setTimeout(() => {
          signOut({ callbackUrl: "/auth/login" });
        }, 1500);
      } else {
        toast.error(result.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordInput
              label="Current Password"
              register={register}
              name="oldPassword"
              error={errors.oldPassword?.message}
            />

            <PasswordInput
              label="New Password"
              register={register}
              name="newPassword"
              error={errors.newPassword?.message}
            />

            <PasswordInput
              label="Confirm New Password"
              register={register}
              name="confirmPassword"
              error={errors.confirmPassword?.message}
            />
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 border rounded-lg p-3 mt-2">
            <RuleItem
              valid={passwordRules.minLength}
              label="At least 8 characters include:"
              showIcon={false}
            />
            <ul className="space-y-1">
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
                label="1 special character (Eg. .,/?';[]{}`!@#$%^&*()_+=-)"
              />
            </ul>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-6">
            <button
              type="button"
              onClick={() => reset()}
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
