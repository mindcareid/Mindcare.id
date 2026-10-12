"use client";

import { IoIosPhonePortrait } from "react-icons/io";
import { MdAlternateEmail, MdEmail } from "react-icons/md";
import { useForm, UseFormRegister } from "react-hook-form";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileFormData } from "@/lib/validations/auth";
import { useSession } from "next-auth/react";
import type { User } from "@/types/auth";
import type { IconType } from "react-icons";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

const fieldLabelClassName = "text-sm font-medium text-foreground";
const inputClassName =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted";

const ReadOnlyField = ({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: string;
}) => (
  <div className="flex flex-col gap-1.5 cursor-not-allowed">
    <span className={fieldLabelClassName}>{label}</span>
    <div className="flex min-h-10 items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{value}</span>
    </div>
  </div>
);

const EditableField = ({
  label,
  register,
  name,
  placeholder,
  error,
}: {
  label: string;
  register: UseFormRegister<ProfileFormData>;
  name: keyof ProfileFormData;
  placeholder?: string;
  error?: string;
}) => {
  const id = `profile-${String(name)}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={fieldLabelClassName}>
        {label}
      </label>
      <input
        id={id}
        {...register(name)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={inputClassName}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

const ContactField = ({
  icon: Icon,
  label,
  value,
  isVerified,
  onVerify,
  isLoading,
}: {
  isLoading?: boolean;
  icon: IconType;
  label: string;
  value: string;
  isVerified?: boolean;
  onVerify?: () => void;
}) => (
  <div className="flex flex-col gap-1.5">
    <span className={fieldLabelClassName}>{label}</span>
    <div className="flex min-h-10 items-center justify-between gap-3 rounded-lg border border-border bg-muted px-3 py-2">
      <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{value}</span>
        {isVerified && (
          <Image
            src="/images/icon/verified.svg"
            alt="Verified"
            width={18}
            height={18}
            className="shrink-0"
          />
        )}
      </span>

      {!isVerified && onVerify && (
        <button
          type="button"
          onClick={onVerify}
          disabled={isLoading}
          className="shrink-0 text-sm font-medium cursor-pointer text-primary transition-colors hover:text-brand-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Verify"}
        </button>
      )}
    </div>
  </div>
);

const GenderSelector = ({
  register,
  defaultValue,
}: {
  register: UseFormRegister<ProfileFormData>;
  defaultValue?: string | null;
}) => (
  <div className="flex flex-col gap-1.5">
    <span className={fieldLabelClassName}>Gender</span>
    <div className="flex min-h-10 items-center gap-6 rounded-lg border border-border bg-card px-3 py-2">
      {["male", "female"].map((gender) => (
        <label key={gender} className="flex cursor-pointer items-center gap-2">
          <input
            {...register("gender")}
            type="radio"
            value={gender}
            defaultChecked={defaultValue === gender}
            className="size-4 accent-primary"
          />
          <span className="text-sm capitalize text-foreground">{gender}</span>
        </label>
      ))}
    </div>
  </div>
);

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-4">
    <div className="space-y-0.5">
      <h2 className="font-heading text-base font-semibold text-foreground">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {children}
  </section>
);

export default function PersonalInformation({ user }: { user: User }) {
  const [isLoading, setIsLoading] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const { update } = useSession();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: user?.bio || "",
      fullname: user?.name || "",
      jobTitle: user?.jobTitle || "",
      jobName: user?.jobName || "",
      gender: (user?.gender as "male" | "female" | undefined) ?? undefined,
    },
  });
  const [isVerifying, setIsVerifying] = useState({
    phone: false,
    email: false,
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    const previousUser = localUser;
    setLocalUser((prev) => ({
      ...prev,
      name: data.fullname,
      bio: data.bio,
      jobTitle: data.jobTitle,
      jobName: data.jobName,
      gender: data.gender,
    }));

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }
      await update({
        name: result.data.name,
        bio: result.data.bio,
        jobTitle: result.data.jobTitle,
        jobName: result.data.jobName,
        gender: result.data.gender,
      });

      toast.success("Profile updated successfully");
      reset(data);
    } catch (error) {
      console.error("Update profile error:", error);
      setLocalUser(previousUser);
      toast.error("Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsVerifying((prev) => ({ ...prev, email: true }));
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success("Verification email sent!", {
        description: "Check your inbox.",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsVerifying((prev) => ({ ...prev, email: false }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-border bg-card p-5 md:p-6"
    >
      <div className="border-b border-border pb-5">
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Personal information
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Update your name, bio, and work details.
        </p>
      </div>

      <div className="space-y-6 py-6">
        <Section title="Basic details">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ReadOnlyField
              icon={MdAlternateEmail}
              label="Username"
              value={user?.username ?? "-"}
            />

            <EditableField
              label="Full name"
              register={register}
              name="fullname"
              error={errors.fullname?.message}
            />

            <GenderSelector register={register} defaultValue={user?.gender} />

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="profile-bio" className={fieldLabelClassName}>
                Bio
              </label>
              {!user?.bio && (
                <p className="text-xs italic text-muted-foreground">
                  This user hasn&apos;t created a bio yet.
                </p>
              )}
              <textarea
                id="profile-bio"
                {...register("bio")}
                rows={3}
                placeholder="Write something about yourself..."
                aria-invalid={Boolean(errors.bio)}
                className={`${inputClassName} resize-none`}
              />
              {errors.bio && (
                <p className="text-xs text-destructive">{errors.bio.message}</p>
              )}
            </div>
          </div>
        </Section>

        <div className="border-t border-border pt-6">
          <Section title="Work">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <EditableField
                label="Job title"
                register={register}
                name="jobTitle"
                placeholder="IT Manager"
                error={errors.jobTitle?.message}
              />

              <EditableField
                label="Company name"
                register={register}
                name="jobName"
                placeholder="PT. Tribun Asia Tbk."
                error={errors.jobName?.message}
              />
            </div>
          </Section>
        </div>

        <div className="border-t border-border pt-6">
          <Section title="Contact">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ContactField
                icon={IoIosPhonePortrait}
                label="Phone"
                value={user?.phoneNumber ?? "-"}
                isVerified={false}
              />

              <ContactField
                icon={MdEmail}
                label="Email"
                value={user?.email ?? "-"}
                isVerified={user?.emailVerified}
                isLoading={isVerifying.email}
                onVerify={!user?.emailVerified ? handleVerifyEmail : undefined}
              />
            </div>
          </Section>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => reset()}
          disabled={isLoading || !isDirty}
          className={buttonStyles({
            variant: "outline",
            size: "md",
            className: "w-full sm:w-auto",
          })}
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={isLoading || !isDirty}
          className={buttonStyles({
            size: "md",
            className: "w-full sm:w-auto",
          })}
        >
          {isLoading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
