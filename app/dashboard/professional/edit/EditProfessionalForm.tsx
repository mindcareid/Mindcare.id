"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFieldArray, useForm, type Path } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  EditProfessionalSchema,
  PROFESSION_OPTIONS,
} from "@/lib/validations/apply";
import Button from "@/app/components/reusable/Button";
import {
  ApplyField,
  ApplySection,
  applyCheckboxClassName,
  applyInputClassName,
} from "@/app/apply/component/ApplyField";

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
  services: {
    name: string;
    mode: "Online" | "In Person";
    durationMinutes: number;
    priceIdr: number;
  }[];
  licenceType: string;
  licenceNumber: string;
  licenceValidUntil: string;
};

export default function EditProfessionalForm({
  areas,
  initialValues,
}: {
  areas: AreaOption[];
  initialValues: {
    fullName: string;
    credentials: string;
    profession: string;
    headline: string;
    bio: string;
    baseCity: string;
    baseProvince: string;
    languages: string[];
    yearsOfExperience: number;
    areaSlugs: string[];
    services: FormValues["services"];
    licenceType: string;
    licenceNumber: string;
    licenceValidUntil: string;
  };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      ...initialValues,
      profession:
        initialValues.profession as FormValues["profession"],
      languagesText: initialValues.languages.join(", "),
    },
    mode: "onTouched",
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({ control, name: "services" });

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
    };

    const parsed = EditProfessionalSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        const target = path === "languages" ? "languagesText" : path;
        setError(target as Path<FormValues>, { message: issue.message });
      }
      toast.error("Please check the highlighted fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/professional", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save");

      toast.success(
        json.data?.requiresReview ? "Saved — back under review" : "Saved",
        {
          description: json.message,
        },
      );
      router.push("/dashboard/professional");
      router.refresh();
    } catch (err) {
      toast.error("Could not save", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">
      <ApplySection
        title="About you"
        description="Saved immediately — no review needed."
      >
        <ApplyField
          label="Headline"
          htmlFor="headline"
          required
          error={errors.headline?.message}
        >
          <input
            id="headline"
            {...register("headline")}
            className={applyInputClassName(Boolean(errors.headline))}
          />
        </ApplyField>

        <ApplyField
          label="About"
          htmlFor="bio"
          required
          error={errors.bio?.message}
        >
          <textarea
            id="bio"
            rows={6}
            {...register("bio")}
            className={applyInputClassName(Boolean(errors.bio))}
          />
        </ApplyField>

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
            hint="Separate with commas"
          >
            <input
              id="languagesText"
              {...register("languagesText")}
              className={applyInputClassName(Boolean(errors.languagesText))}
            />
          </ApplyField>
        </div>

        <ApplyField
          label="Areas of support"
          required
          error={errors.areaSlugs?.message}
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
          </div>
        </ApplyField>
      </ApplySection>

      <ApplySection
        title="Sessions & pricing"
        description="Saved immediately. The lowest price becomes your “from” price."
      >
        {errors.services?.message ? (
          <p className="text-xs text-destructive">{errors.services.message}</p>
        ) : null}
        {serviceFields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-4 rounded-xl border border-border bg-card p-4"
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
        title="Identity & licence"
        description="Changing anything here sends your listing back for review and hides it from the directory until it is approved again."
      >
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
          These are the details we check against the registry. The licence
          number stays private either way.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <ApplyField
            label="Full name"
            htmlFor="fullName"
            required
            error={errors.fullName?.message}
          >
            <input
              id="fullName"
              {...register("fullName")}
              className={applyInputClassName(Boolean(errors.fullName))}
            />
          </ApplyField>

          <ApplyField
            label="Credentials"
            htmlFor="credentials"
            required
            error={errors.credentials?.message}
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

          <ApplyField
            label="Licence type"
            htmlFor="licenceType"
            required
            error={errors.licenceType?.message}
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

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
        <Link
          href="/dashboard/professional"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
