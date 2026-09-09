"use client";
//import { formatDate } from "@/lib/utils/FormatDate";
import { IoIosPhonePortrait } from "react-icons/io";
import { MdAlternateEmail, MdEmail } from "react-icons/md";
//import { FaRegCalendarCheck } from "react-icons/fa6";
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

// Reusable Components
const ReadOnlyField = ({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-2 bg-gray-300 border-transparent rounded-xl px-5 py-4 shadow-sm cursor-not-allowed">
    <Icon className="w-5 h-5" />
    <p className="text-sm font-semibold text-gray-800">{label}:</p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
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
}) => (
  <div className="flex flex-col gap-1">
    <div className="bg-white border rounded-xl px-5 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
          {label}:
        </p>
        <input
          {...register(name)}
          className="flex-1 text-sm font-medium text-gray-900 bg-transparent outline-none"
          placeholder={placeholder}
        />
      </div>
    </div>
    {error && <p className="text-xs text-red-500 px-2">{error}</p>}
  </div>
);

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
  <div className="flex items-center justify-between bg-white border rounded-xl px-5 py-4 shadow-sm">
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5" />
      <p className="text-sm font-semibold text-gray-800">{label}:</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>

      {isVerified && (
        <div className="relative group flex items-center">
          <Image
            src="/images/icon/verified.svg"
            alt="Verified"
            width={18}
            height={18}
            className="cursor-pointer"
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap pointer-events-none">
            {label} Verified
          </div>
        </div>
      )}
    </div>

    {!isVerified && onVerify && (
      <button
        type="button"
        onClick={onVerify}
        disabled={isLoading}
        className="text-blue-600 text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Sending..." : "Verify"}
      </button>
    )}
  </div>
);

const GenderSelector = ({
  register,
  defaultValue,
}: {
  register: UseFormRegister<ProfileFormData>;
  defaultValue?: string | null;
}) => (
  <div className="flex items-center justify-between rounded-xl px-5 py-4 shadow-sm">
    <p className="text-sm font-semibold text-gray-800">Gender:</p>
    <div className="flex gap-6">
      {["male", "female"].map((gender) => (
        <label key={gender} className="flex items-center gap-2 cursor-pointer">
          <input
            {...register("gender")}
            type="radio"
            value={gender}
            defaultChecked={defaultValue === gender}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700 capitalize">{gender}</span>
        </label>
      ))}
    </div>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section>
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
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
      className="bg-white border border-gray-200 rounded-2xl px-4 py-5 overflow-hidden"
    >
      <div className="flex items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Personal information
          </h1>
          <p className="text-sm text-gray-500">
            Update your name, bio, and work details.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 shrink-0">
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className={buttonStyles({ size: "sm" })}
          >
            {isLoading ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            disabled={isLoading || !isDirty}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Discard
          </button>
        </div>
      </div>
      <Section title="Personal information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField
            icon={MdAlternateEmail}
            label="Username"
            value={user?.username ?? "-"}
          />

          <EditableField
            label="Full Name"
            register={register}
            name="fullname"
            error={errors.fullname?.message}
          />

          <GenderSelector register={register} defaultValue={user?.gender} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bio
            </label>
            {!user?.bio && (
              <p className="text-xs text-gray-400 italic mb-2">
                This user hasn&apos;t created a bio yet.
              </p>
            )}
            <textarea
              {...register("bio")}
              rows={3}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-shadow"
              placeholder="Write something about yourself..."
            />
            {errors.bio && (
              <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>
            )}
          </div>
        </div>
      </Section>
      <div className="h-px bg-gray-200" />

      <Section title="Work">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField
            label="Job Title"
            register={register}
            name="jobTitle"
            placeholder="IT Manager"
            error={errors.jobTitle?.message}
          />

          <EditableField
            label="Company Name"
            register={register}
            name="jobName"
            placeholder="PT. Tribun Asia Tbk."
            error={errors.jobName?.message}
          />
        </div>
      </Section>

      <div className="h-px bg-gray-200" />
      <Section title="Contact">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ContactField
            icon={IoIosPhonePortrait}
            label="Phone"
            value={user?.phonenumber ?? "-"}
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
    </form>
  );
}
