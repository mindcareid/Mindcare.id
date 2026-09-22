"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useFieldArray, useForm, type Path } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ApplyProfessionalSchema,
  PROFESSION_OPTIONS,
  type ProfessionalServiceFormData,
} from "@/lib/validations/apply";
import Button from "@/app/components/reusable/Button";
import ApplicationNotice from "../component/ApplicationNotice";
import {
  ApplyField,
  ApplySection,
  applyCheckboxClassName,
  applyInputClassName,
} from "../component/ApplyField";

type AreaOption = { slug: string; name: string };

type FormValues = {
  fullName: string;
  credentials: string;
  profession: (typeof PROFESSION_OPTIONS)[number];
  headline: string;
  bio: string;
  baseCity: string;
  baseProvince: string;
  languagesText: string;
  yearsOfExperience: number;
  areaSlugs: string[];
  services: ProfessionalServiceFormData[];
  licenceType: string;
  licenceNumber: string;
  licenceValidUntil: string;
  acceptTerms: boolean;
};

const defaultValues: FormValues = {
  fullName: "",
  credentials: "",
  profession: "Psikolog",
  headline: "",
  bio: "",
  baseCity: "",
  baseProvince: "",
  languagesText: "",
  yearsOfExperience: 0,
  areaSlugs: [],
  services: [{ name: "", mode: "Online", durationMinutes: 60, priceIdr: 0 }],
  licenceType: "",
  licenceNumber: "",
  licenceValidUntil: "",
  acceptTerms: false,
};

type ExistingApplication = {
  slug: string;
  fullName: string;
  listingStatus: string;
};

export default function ProfessionalForm({ areas }: { areas: AreaOption[] }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [existing, setExisting] = useState<ExistingApplication | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues,
    mode: "onTouched",
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({ control, name: "services" });

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth?tab=login&callbackUrl=/apply/professional");
      return;
    }

    let cancelled = false;
    fetch("/api/apply/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        if (json?.data?.professional) {
          setExisting(json.data.professional as ExistingApplication);
        }
        setStatusLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setStatusLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [status, session, router]);

  const acceptTerms = watch("acceptTerms");

  const onSubmit = async (values: FormValues) => {
    const payload = {
      fullName: values.fullName,
      credentials: values.credentials,
      profession: values.profession,
      headline: values.headline,
      bio: values.bio,
      baseCity: values.baseCity,
      baseProvince: values.baseProvince,
      languages: values.languagesText
        .split(",")
        .map((lang) => lang.trim())
        .filter(Boolean),
      yearsOfExperience: values.yearsOfExperience,
      areaSlugs: values.areaSlugs,
      services: values.services,
      licenceType: values.licenceType,
      licenceNumber: values.licenceNumber,
      licenceValidUntil: values.licenceValidUntil,
      acceptTerms: values.acceptTerms,
    };

    const parsed = ApplyProfessionalSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        const target = path === "languages" ? "languagesText" : path;
        setError(target as Path<FormValues>, { message: issue.message });
      }
      toast.error("Please check the highlighted fields", {
        description: "Some details still need to be filled in correctly.",
      });
      return;
    }

    try {
      const res = await fetch("/api/apply/professional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to submit application");
      }

      router.push("/apply/submitted");
    } catch (err) {
      toast.error("Submission failed", {
        description:
          err instanceof Error ? err.message : "Please try again later.",
      });
    }
  };

  if (status === "loading" || !statusLoaded) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-8 shadow-card">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
        <p className="text-sm text-muted-foreground">
          Checking your application status...
        </p>
      </div>
    );
  }

  if (existing) {
    return (
      <ApplicationNotice
        entity="professional"
        name={existing.fullName}
        listingStatus={existing.listingStatus}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-10">
        <ApplySection
          title="About you"
          description="How you will be introduced in the directory."
        >
          <ApplyField
            label="Full name"
            htmlFor="fullName"
            required
            error={errors.fullName?.message}
          >
            <input
              id="fullName"
              {...register("fullName")}
              placeholder="Nama lengkap sesuai izin praktik"
              className={applyInputClassName(Boolean(errors.fullName))}
            />
          </ApplyField>

          <div className="grid gap-5 md:grid-cols-2">
            <ApplyField
              label="Credentials"
              htmlFor="credentials"
              required
              error={errors.credentials?.message}
              hint="Degrees and titles, e.g. M.Psi., Psikolog"
            >
              <input
                id="credentials"
                {...register("credentials")}
                className={applyInputClassName(Boolean(errors.credentials))}
              />
            </ApplyField>

            <ApplyField
              label="Profession"
              htmlFor="profession"
              required
              error={errors.profession?.message}
            >
              <select
                id="profession"
                {...register("profession")}
                className={applyInputClassName(Boolean(errors.profession))}
              >
                {PROFESSION_OPTIONS.map((profession) => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
              </select>
            </ApplyField>
          </div>

          <ApplyField
            label="Headline"
            htmlFor="headline"
            required
            error={errors.headline?.message}
            hint="One sentence shown under your name."
          >
            <input
              id="headline"
              {...register("headline")}
              placeholder="Individual therapy for anxiety and burnout"
              className={applyInputClassName(Boolean(errors.headline))}
            />
          </ApplyField>

          <ApplyField
            label="About"
            htmlFor="bio"
            required
            error={errors.bio?.message}
            hint="Tell readers how you work and who you help."
          >
            <textarea
              id="bio"
              {...register("bio")}
              rows={6}
              className={applyInputClassName(Boolean(errors.bio))}
            />
          </ApplyField>
        </ApplySection>

        <ApplySection
          title="Practice details"
          description="Where you are based and how you practise."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <ApplyField
              label="City"
              htmlFor="baseCity"
              required
              error={errors.baseCity?.message}
            >
              <input
                id="baseCity"
                {...register("baseCity")}
                placeholder="Jakarta Selatan"
                className={applyInputClassName(Boolean(errors.baseCity))}
              />
            </ApplyField>

            <ApplyField
              label="Province"
              htmlFor="baseProvince"
              required
              error={errors.baseProvince?.message}
            >
              <input
                id="baseProvince"
                {...register("baseProvince")}
                placeholder="DKI Jakarta"
                className={applyInputClassName(Boolean(errors.baseProvince))}
              />
            </ApplyField>

            <ApplyField
              label="Years of experience"
              htmlFor="yearsOfExperience"
              required
              error={errors.yearsOfExperience?.message}
            >
              <input
                id="yearsOfExperience"
                type="number"
                {...register("yearsOfExperience", { valueAsNumber: true })}
                className={applyInputClassName(
                  Boolean(errors.yearsOfExperience),
                )}
              />
            </ApplyField>

            <ApplyField
              label="Session languages"
              htmlFor="languagesText"
              required
              error={errors.languagesText?.message}
              hint="Separate with commas, e.g. Bahasa Indonesia, English"
            >
              <input
                id="languagesText"
                {...register("languagesText")}
                placeholder="Bahasa Indonesia, English"
                className={applyInputClassName(Boolean(errors.languagesText))}
              />
            </ApplyField>
          </div>

          <ApplyField
            label="Areas of support"
            required
            error={errors.areaSlugs?.message}
            hint="The concerns you work with — pick up to ten."
          >
            <div className="flex flex-wrap gap-x-5 gap-y-3 rounded-lg border border-border bg-card p-4">
              {areas.map((area) => (
                <label
                  key={area.slug}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <input
                    type="checkbox"
                    value={area.slug}
                    {...register("areaSlugs")}
                    className={applyCheckboxClassName}
                  />
                  {area.name}
                </label>
              ))}
              {areas.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Areas of support are temporarily unavailable.
                </p>
              ) : null}
            </div>
          </ApplyField>
        </ApplySection>

        <ApplySection
          title="Sessions & pricing"
          description="What clients get and what it costs. The lowest price becomes the “from” price on your card."
        >
          {errors.services?.message ? (
            <p className="text-xs text-destructive">
              {errors.services.message}
            </p>
          ) : null}
          {serviceFields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-foreground">
                  Session type {index + 1}
                </p>
                {serviceFields.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
                    aria-label={`Remove session type ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                ) : null}
              </div>

              <ApplyField
                label="Name"
                htmlFor={`services-${index}-name`}
                required
                error={errors.services?.[index]?.name?.message}
              >
                <input
                  id={`services-${index}-name`}
                  {...register(`services.${index}.name` as const)}
                  placeholder="Konsultasi dewasa"
                  className={applyInputClassName(
                    Boolean(errors.services?.[index]?.name),
                  )}
                />
              </ApplyField>

              <div className="grid gap-5 md:grid-cols-3">
                <ApplyField
                  label="Mode"
                  htmlFor={`services-${index}-mode`}
                  required
                  error={errors.services?.[index]?.mode?.message}
                >
                  <select
                    id={`services-${index}-mode`}
                    {...register(`services.${index}.mode` as const)}
                    className={applyInputClassName(
                      Boolean(errors.services?.[index]?.mode),
                    )}
                  >
                    <option value="Online">Online</option>
                    <option value="In Person">In Person</option>
                  </select>
                </ApplyField>

                <ApplyField
                  label="Duration (minutes)"
                  htmlFor={`services-${index}-duration`}
                  required
                  error={errors.services?.[index]?.durationMinutes?.message}
                >
                  <input
                    id={`services-${index}-duration`}
                    type="number"
                    {...register(`services.${index}.durationMinutes` as const, {
                      valueAsNumber: true,
                    })}
                    className={applyInputClassName(
                      Boolean(errors.services?.[index]?.durationMinutes),
                    )}
                  />
                </ApplyField>

                <ApplyField
                  label="Price (IDR)"
                  htmlFor={`services-${index}-price`}
                  required
                  error={errors.services?.[index]?.priceIdr?.message}
                >
                  <input
                    id={`services-${index}-price`}
                    type="number"
                    {...register(`services.${index}.priceIdr` as const, {
                      valueAsNumber: true,
                    })}
                    className={applyInputClassName(
                      Boolean(errors.services?.[index]?.priceIdr),
                    )}
                  />
                </ApplyField>
              </div>
            </div>
          ))}

          {serviceFields.length < 10 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() =>
                appendService({
                  name: "",
                  mode: "Online",
                  durationMinutes: 60,
                  priceIdr: 0,
                })
              }
            >
              Add session type
            </Button>
          ) : null}
        </ApplySection>

        <ApplySection
          title="Practice licence"
          description="Used only to check your registration before your profile is listed."
        >
          <p className="rounded-lg border border-border bg-brand-lavender-100 p-4 text-sm text-foreground">
            Your licence number is never shown on public pages. We use it to
            check your registration, then record only the check result. See{" "}
            <Link
              href="/help/verification-policy"
              className="font-medium text-primary hover:underline"
            >
              how verification works
            </Link>
            .
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <ApplyField
              label="Licence type"
              htmlFor="licenceType"
              required
              error={errors.licenceType?.message}
              hint="e.g. STR, SIPP"
            >
              <input
                id="licenceType"
                {...register("licenceType")}
                className={applyInputClassName(Boolean(errors.licenceType))}
              />
            </ApplyField>

            <ApplyField
              label="Licence number"
              htmlFor="licenceNumber"
              required
              error={errors.licenceNumber?.message}
            >
              <input
                id="licenceNumber"
                {...register("licenceNumber")}
                className={applyInputClassName(Boolean(errors.licenceNumber))}
              />
            </ApplyField>

            <ApplyField
              label="Valid until"
              htmlFor="licenceValidUntil"
              required
              error={errors.licenceValidUntil?.message}
            >
              <input
                id="licenceValidUntil"
                type="date"
                {...register("licenceValidUntil")}
                className={applyInputClassName(
                  Boolean(errors.licenceValidUntil),
                )}
              />
            </ApplyField>
          </div>
        </ApplySection>

        <div className="space-y-4">
          <label
            htmlFor="acceptTerms"
            className="flex items-start gap-3 text-sm text-foreground"
          >
            <input
              id="acceptTerms"
              type="checkbox"
              {...register("acceptTerms")}
              className={cn(applyCheckboxClassName, "mt-0.5")}
            />
            <span>
              I confirm the information above is accurate and I am the person
              named on the licence.
            </span>
          </label>
          {errors.acceptTerms?.message ? (
            <p className="text-xs text-destructive">
              {errors.acceptTerms.message}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || !acceptTerms}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit application"}
          </Button>
        </div>
      </div>
    </form>
  );
}
