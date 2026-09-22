"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type Path } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  EditCareCentreSchema,
  CENTRE_KIND_OPTIONS,
  CENTRE_TIME_ZONE_OPTIONS,
} from "@/lib/validations/apply";
import Button from "@/app/components/reusable/Button";
import {
  ApplyField,
  ApplySection,
  applyCheckboxClassName,
  applyInputClassName,
} from "@/app/apply/component/ApplyField";

type ServiceOption = { slug: string; name: string };

const WEEKDAYS: Array<{ day: 1 | 2 | 3 | 4 | 5 | 6 | 7; label: string }> = [
  { day: 1, label: "Monday" },
  { day: 2, label: "Tuesday" },
  { day: 3, label: "Wednesday" },
  { day: 4, label: "Thursday" },
  { day: 5, label: "Friday" },
  { day: 6, label: "Saturday" },
  { day: 7, label: "Sunday" },
];

const TIME_ZONE_LABELS: Record<
  (typeof CENTRE_TIME_ZONE_OPTIONS)[number],
  string
> = {
  "Asia/Jakarta": "WIB — Jakarta",
  "Asia/Makassar": "WITA — Makassar",
  "Asia/Jayapura": "WIT — Jayapura",
};

type FormValues = {
  name: string;
  kind: (typeof CENTRE_KIND_OPTIONS)[number];
  description: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  website: string;
  acceptsBpjs: boolean;
  timeZone: (typeof CENTRE_TIME_ZONE_OPTIONS)[number];
  openingNote: string;
  openingHours: {
    day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    opens: string;
    closes: string;
  }[];
  serviceSlugs: string[];
  permitType: string;
  permitNumber: string;
  permitValidUntil: string;
};

export default function EditCareCentreForm({
  services,
  initialValues,
}: {
  services: ServiceOption[];
  initialValues: FormValues;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      description: values.description || undefined,
      website: values.website || "",
      openingNote: values.openingNote || undefined,
      openingHours: values.openingHours.map((hour) => ({
        day: hour.day,
        opens: hour.opens === "" ? null : hour.opens,
        closes: hour.closes === "" ? null : hour.closes,
      })),
    };

    const parsed = EditCareCentreSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path.join(".") as Path<FormValues>, {
          message: issue.message,
        });
      }
      toast.error("Please check the highlighted fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/care-centre", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save");

      toast.success(
        json.data?.requiresReview ? "Saved — back under review" : "Saved",
        { description: json.message },
      );
      router.push("/dashboard/care-centre");
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
        title="Public details"
        description="Saved immediately — no review needed."
      >
        <ApplyField
          label="Description"
          htmlFor="description"
          error={errors.description?.message}
        >
          <textarea
            id="description"
            rows={4}
            {...register("description")}
            className={applyInputClassName(Boolean(errors.description))}
          />
        </ApplyField>

        <div className="grid gap-5 md:grid-cols-2">
          <ApplyField
            label="Phone"
            htmlFor="phone"
            required
            error={errors.phone?.message}
          >
            <input
              id="phone"
              {...register("phone")}
              className={applyInputClassName(Boolean(errors.phone))}
            />
          </ApplyField>

          <ApplyField
            label="Website"
            htmlFor="website"
            error={errors.website?.message}
            hint="Optional — must start with https://"
          >
            <input
              id="website"
              {...register("website")}
              className={applyInputClassName(Boolean(errors.website))}
            />
          </ApplyField>

          <ApplyField
            label="Time zone"
            htmlFor="timeZone"
            required
            error={errors.timeZone?.message}
          >
            <select
              id="timeZone"
              {...register("timeZone")}
              className={applyInputClassName(Boolean(errors.timeZone))}
            >
              {CENTRE_TIME_ZONE_OPTIONS.map((zone) => (
                <option key={zone} value={zone}>
                  {TIME_ZONE_LABELS[zone]}
                </option>
              ))}
            </select>
          </ApplyField>
        </div>

        <label
          htmlFor="acceptsBpjs"
          className="flex items-center gap-2 text-sm text-foreground"
        >
          <input
            id="acceptsBpjs"
            type="checkbox"
            {...register("acceptsBpjs")}
            className={applyCheckboxClassName}
          />
          This centre accepts BPJS
        </label>
      </ApplySection>

      <ApplySection
        title="Opening hours"
        description="Saved immediately. Leave both times empty on days the centre is closed."
      >
        {errors.openingHours?.message ? (
          <p className="text-xs text-destructive">
            {errors.openingHours.message}
          </p>
        ) : null}
        <div className="space-y-3">
          {WEEKDAYS.map(({ day, label }, index) => (
            <div
              key={day}
              className="grid grid-cols-1 items-center gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[8rem_1fr_1fr]"
            >
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
              <input
                type="hidden"
                {...register(`openingHours.${index}.day` as const, {
                  valueAsNumber: true,
                })}
              />
              <input
                type="time"
                aria-label={`${label} opens`}
                {...register(`openingHours.${index}.opens` as const)}
                className={applyInputClassName(
                  Boolean(errors.openingHours?.[index]?.opens),
                )}
              />
              <input
                type="time"
                aria-label={`${label} closes`}
                {...register(`openingHours.${index}.closes` as const)}
                className={applyInputClassName(
                  Boolean(errors.openingHours?.[index]?.closes),
                )}
              />
            </div>
          ))}
        </div>

        <ApplyField
          label="Note under the opening hours"
          htmlFor="openingNote"
          error={errors.openingNote?.message}
        >
          <input
            id="openingNote"
            {...register("openingNote")}
            className={applyInputClassName(Boolean(errors.openingNote))}
          />
        </ApplyField>
      </ApplySection>

      <ApplySection title="Services" description="Saved immediately.">
        <ApplyField
          label="Services offered"
          required
          error={errors.serviceSlugs?.message}
        >
          <div className="flex flex-wrap gap-x-5 gap-y-3 rounded-lg border border-border bg-card p-4">
            {services.map((service) => (
              <label
                key={service.slug}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  value={service.slug}
                  {...register("serviceSlugs")}
                  className={applyCheckboxClassName}
                />
                {service.name}
              </label>
            ))}
          </div>
        </ApplyField>
      </ApplySection>

      <ApplySection
        title="Identity & permit"
        description="Changing anything here sends the listing back for review and hides it from the directory until it is approved again."
      >
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
          These are the details we check against the permit. The permit number
          stays private either way.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <ApplyField
            label="Centre name"
            htmlFor="name"
            required
            error={errors.name?.message}
          >
            <input
              id="name"
              {...register("name")}
              className={applyInputClassName(Boolean(errors.name))}
            />
          </ApplyField>

          <ApplyField
            label="Type of centre"
            htmlFor="kind"
            required
            error={errors.kind?.message}
            hint="Puskesmas listings are curated by our team."
          >
            <select
              id="kind"
              {...register("kind")}
              className={applyInputClassName(Boolean(errors.kind))}
            >
              {CENTRE_KIND_OPTIONS.filter((kind) => kind !== "Puskesmas").map(
                (kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ),
              )}
            </select>
          </ApplyField>
        </div>

        <ApplyField
          label="Street address"
          htmlFor="street"
          required
          error={errors.street?.message}
        >
          <input
            id="street"
            {...register("street")}
            className={applyInputClassName(Boolean(errors.street))}
          />
        </ApplyField>

        <div className="grid gap-5 md:grid-cols-2">
          <ApplyField
            label="City"
            htmlFor="city"
            required
            error={errors.city?.message}
          >
            <input
              id="city"
              {...register("city")}
              className={applyInputClassName(Boolean(errors.city))}
            />
          </ApplyField>

          <ApplyField
            label="Province"
            htmlFor="province"
            required
            error={errors.province?.message}
          >
            <input
              id="province"
              {...register("province")}
              className={applyInputClassName(Boolean(errors.province))}
            />
          </ApplyField>

          <ApplyField
            label="Postal code"
            htmlFor="postalCode"
            required
            error={errors.postalCode?.message}
          >
            <input
              id="postalCode"
              {...register("postalCode")}
              className={applyInputClassName(Boolean(errors.postalCode))}
            />
          </ApplyField>

          <ApplyField
            label="Permit type"
            htmlFor="permitType"
            required
            error={errors.permitType?.message}
          >
            <input
              id="permitType"
              {...register("permitType")}
              className={applyInputClassName(Boolean(errors.permitType))}
            />
          </ApplyField>

          <ApplyField
            label="Permit number"
            htmlFor="permitNumber"
            required
            error={errors.permitNumber?.message}
          >
            <input
              id="permitNumber"
              {...register("permitNumber")}
              className={applyInputClassName(Boolean(errors.permitNumber))}
            />
          </ApplyField>

          <ApplyField
            label="Valid until"
            htmlFor="permitValidUntil"
            required
            error={errors.permitValidUntil?.message}
          >
            <input
              id="permitValidUntil"
              type="date"
              {...register("permitValidUntil")}
              className={applyInputClassName(Boolean(errors.permitValidUntil))}
            />
          </ApplyField>
        </div>
      </ApplySection>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={saving}
          className={cn(saving && "opacity-70")}
        >
          {saving ? "Saving..." : "Save changes"}
        </Button>
        <Link
          href="/dashboard/care-centre"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
