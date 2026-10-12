"use client";

import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import RuleItem from "@/app/components/RuleItem";
import {
  changePasswordSchema,
  ChangePasswordFormData,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useForm, useWatch, type UseFormRegister } from "react-hook-form";
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
  register: UseFormRegister<ChangePasswordFormData>;
  name: keyof ChangePasswordFormData;
  error?: string;
  placeholder?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const id = `password-${name}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          {...register(name)}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder || "Enter password"}
          aria-invalid={Boolean(error)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 pr-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          {showPassword ? (
            <AiOutlineEyeInvisible className="size-5" />
          ) : (
            <AiOutlineEye className="size-5" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
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
    try {
      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      });

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-border bg-card p-5 md:p-6"
    >
      <div className="border-b border-border pb-5">
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Change password
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Choose a strong password. You will be signed out afterwards.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-[1fr_320px] lg:gap-8">
        <div className="flex flex-col gap-4">
          <PasswordInput
            label="Current password"
            register={register}
            name="oldPassword"
            error={errors.oldPassword?.message}
          />
          <PasswordInput
            label="New password"
            register={register}
            name="newPassword"
            error={errors.newPassword?.message}
          />
          <PasswordInput
            label="Confirm new password"
            register={register}
            name="confirmPassword"
            error={errors.confirmPassword?.message}
          />
        </div>

        <div className="h-fit lg:sticky lg:top-4">
          <div className="rounded-xl border border-border bg-muted p-4 text-muted-foreground">
            <RuleItem
              valid={passwordRules.minLength}
              label="At least 8 characters include:"
              showIcon={false}
            />
            <ul className="mt-2 space-y-1.5">
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
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => reset()}
          disabled={isLoading}
          className={buttonStyles({
            variant: "outline",
            size: "md",
            className: "w-full sm:w-auto",
          })}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={buttonStyles({
            size: "md",
            className: "w-full sm:w-auto",
          })}
        >
          {isLoading ? "Changing..." : "Change password"}
        </button>
      </div>
    </form>
  );
}
