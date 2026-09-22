"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useForm, type Path } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ApplyCareCentreSchema,
  CENTRE_KIND_OPTIONS,
  CENTRE_TIME_ZONE_OPTIONS,
  type OpeningHourFormData,
} from "@/lib/validations/apply";
import Button from "@/app/components/reusable/Button";
import ApplicationNotice from "../component/ApplicationNotice";
import {
  ApplyField,
  ApplySection,
  applyCheckboxClassName,
  applyInputClassName,
} from "../component/ApplyField";

type ServiceOption = { slug: string; name: string };

const WEEKDAYS: Array<{ day: OpeningHourFormData["day"]; label: string }> = [
  { day: 1, label: "Monday" },
  { day: 2, label: "Tuesday" },
  { day: 3, label: "Wednesday" },
  { day: 4, label: "Thursday" },
  { day: 5, label: "Friday" },
  { day: 6, label: "Saturday" },
  { day: 7, label: "Sunday" },
];

const TIME_ZONE_LABELS: Record<(typeof CENTRE_TIME_ZONE_OPTIONS)[number], string> = {
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
  openingHours: OpeningHourFormData[];
  serviceSlugs: string[];
  permitType: string;
  permitNumber: string;
  permitValidUntil: string;
  acceptTerms: boolean;
};

const defaultValues: FormValues = {
  name: "",
  kind: "Klinik",
  description: "",
  street: "",
  city: "",
  province: "",
  postalCode: "",
  phone: "",
  website: "",
  acceptsBpjs: false,
  timeZone: "Asia/Jakarta",
  openingNote: "",
  openingHours: WEEKDAYS.map(({ day }) => ({
    day,
    opens: "08:00",
    closes: "17:00",
  })),
  serviceSlugs: [],
  permitType: "",
  permitNumber: "",
  permitValidUntil: "",
  acceptTerms: false,
};

type ExistingApplication = {
  slug: string;
  name: string;
  listingStatus: string;
};

export default function CareCentreForm({ services }: { services: ServiceOption[] }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [existing, setExisting] = useState<ExistingApplication | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth?tab=login&callbackUrl=/apply/care-centre");
      return;
    }

    let cancelled = false;
    fetch("/api/apply/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        if (json?.data?.careCentre) {
          setExisting(json.data.careCentre as ExistingApplication);
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
      ...values,
      description: values.description || undefined,
      website: values.website || "",
      openingNote: values.openingNote || undefined,
      openingHours: values.openingHours.map((hour) => ({
        day: hour.day,
        opens: hour.opens === "" ? null : hour.opens,
        closes: hour.closes === "" ? null : hour.closes,
      })),
      serviceSlugs: values.serviceSlugs,
    };

    const parsed = ApplyCareCentreSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path.join(".") as Path<FormValues>, {
          message: issue.message,
        });
      }
      toast.error("Please check the highlighted fields", {
        description: "Some details still need to be filled in correctly.",
      });
      return;
    }

    try {
      const res = await fetch("/api/apply/care-centre", {
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
        entity="care centre"
        name={existing.name}
        listingStatus={existing.listingStatus}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-10">
        <ApplySection
          title="About the centre"
          description="How the centre will be introduced in the directory."
        >
          <ApplyField
            label="Centre name"
            htmlFor="name"
            required
            error={errors.name?.message}
          >
            <input
              id="name"
              {...register("name")}
              placeholder="Klinik Sehat Jiwa"
              className={applyInputClassName(Boolean(errors.name))}
            />
          </ApplyField>

          <ApplyField
            label="Type of centre"
            htmlFor="kind"
            required
            error={errors.kind?.message}
            hint="Puskesmas listings are curated by our team — contact us if you represent one."
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

          <ApplyField
            label="Description"
            htmlFor="description"
            error={errors.description?.message}
            hint="Optional — the services visitors can expect at the centre."
          >
            <textarea
              id="description"
              {...register("description")}
              rows={4}
              className={applyInputClassName(Boolean(errors.description))}
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
              placeholder="https://"
              className={applyInputClassName(Boolean(errors.website))}
            />
          </ApplyField>
        </ApplySection>

        <ApplySection
          title="Location & contact"
          description="Where visitors can find the centre."
        >
          <ApplyField
            label="Street address"
            htmlFor="street"
            required
            error={errors.street?.message}
          >
            <input
              id="street"
              {...register("street")}
              placeholder="Jl. Kemang Raya No. 12"
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
                placeholder="Jakarta Selatan"
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
                placeholder="DKI Jakarta"
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
                inputMode="numeric"
                placeholder="12730"
                className={applyInputClassName(Boolean(errors.postalCode))}
              />
            </ApplyField>

            <ApplyField
              label="Phone"
              htmlFor="phone"
              required
              error={errors.phone?.message}
            >
              <input
                id="phone"
                {...register("phone")}
                placeholder="+62 21 5550 1180"
                className={applyInputClassName(Boolean(errors.phone))}
              />
            </ApplyField>

            <ApplyField
              label="Time zone"
              htmlFor="timeZone"
              required
              error={errors.timeZone?.message}
              hint="Used to show opening hours correctly."
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
          description="Leave both times empty on days the centre is closed."
        >
          {errors.openingHours?.message ? (
            <p className="text-xs text-destructive">
              {errors.openingHours.message}
            </p>
          ) : null}
          <div className="space-y-3">
            {WEEKDAYS.map(({ day, label }, index) => {
              const hourError =
                errors.openingHours?.[index] as
                  | { opens?: { message?: string }; closes?: { message?: string } }
                  | undefined;
              return (
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
                  <div className="space-y-1">
                    <input
                      type="time"
                      aria-label={`${label} opens`}
                      {...register(`openingHours.${index}.opens` as const)}
                      className={applyInputClassName(Boolean(hourError?.opens))}
                    />
                    {hourError?.opens?.message ? (
                      <p className="text-xs text-destructive">
                        {hourError.opens.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="time"
                      aria-label={`${label} closes`}
                      {...register(`openingHours.${index}.closes` as const)}
                      className={applyInputClassName(Boolean(hourError?.closes))}
                    />
                    {hourError?.closes?.message ? (
                      <p className="text-xs text-destructive">
                        {hourError.closes.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <ApplyField
            label="Note under the opening hours"
            htmlFor="openingNote"
            error={errors.openingNote?.message}
            hint="Optional — e.g. changes on national holidays."
          >
            <input
              id="openingNote"
              {...register("openingNote")}
              className={applyInputClassName(Boolean(errors.openingNote))}
            />
          </ApplyField>
        </ApplySection>

        <ApplySection
          title="Services"
          description="What visitors can come to the centre for."
        >
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
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Services are temporarily unavailable.
                </p>
              ) : null}
            </div>
          </ApplyField>
        </ApplySection>

        <ApplySection
          title="Operating permit"
          description="Used only to check the centre's registration and your authority to represent it."
        >
          <p className="rounded-lg border border-border bg-brand-lavender-100 p-4 text-sm text-foreground">
            The permit number is never shown on public pages. We use it to check
            the centre&apos;s registration, then record only the check result.
            See{" "}
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
              label="Permit type"
              htmlFor="permitType"
              required
              error={errors.permitType?.message}
              hint="e.g. NIB, izin operasional"
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
              I confirm the information above is accurate and I am authorised to
              represent this centre.
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
