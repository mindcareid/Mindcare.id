"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, type Path } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ApplySolutionSchema,
  EditSolutionSchema,
} from "@/lib/validations/apply";
import Button from "@/app/components/reusable/Button";
import ImageUploadField from "@/app/components/reusable/ImageUploadField";
import {
  ApplyField,
  ApplySection,
  applyCheckboxClassName,
  applyInputClassName,
} from "@/app/apply/component/ApplyField";

type Option = { slug: string; name: string };

type FormValues = {
  organizationName: string;
  name: string;
  tagline: string;
  description: string;
  categorySlug: string;
  audienceSlugs: string[];
  focusSlugs: string[];
  deliveryFormat: "Online" | "In Person" | "Hybrid" | "Publication" | "Product";
  serviceArea: string;
  featuresText: string;
  evidence: { label: string; url: string }[];
  pricingModel:
    | "Free"
    | "One-time"
    | "Subscription"
    | "Tiered"
    | "Request information";
  priceFromIdr: number;
  website: string;
  brochureUrl: string;
  videoUrl: string;
  contactEmail: string;
  contactPhone: string;
  /** Logo persegi + cover 16:9, dengan public_id pendamping. */
  logo: string;
  logoPublicId: string;
  coverImage: string;
  coverPublicId: string;
  acceptTerms: boolean;
};

export default function SolutionForm({
  categories,
  audiences,
  areas,
  solutionId,
  initialValues,
}: {
  categories: Option[];
  audiences: Option[];
  areas: Option[];
  /** Diisi = mode edit (PATCH ke /api/dashboard/solution/[id]). */
  solutionId?: number;
  initialValues?: Partial<FormValues>;
}) {
  const router = useRouter();
  const isEdit = typeof solutionId === "number";
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      organizationName: "",
      name: "",
      tagline: "",
      description: "",
      categorySlug: categories[0]?.slug ?? "",
      audienceSlugs: [],
      focusSlugs: [],
      deliveryFormat: "Online",
      serviceArea: "",
      featuresText: "",
      evidence: [{ label: "", url: "" }],
      pricingModel: "Request information",
      priceFromIdr: 0,
      website: "",
      brochureUrl: "",
      videoUrl: "",
      contactEmail: "",
      contactPhone: "",
      logo: "",
      logoPublicId: "",
      coverImage: "",
      coverPublicId: "",
      acceptTerms: false,
      ...initialValues,
    },
    mode: "onTouched",
  });

  const {
    fields: evidenceFields,
    append: appendEvidence,
    remove: removeEvidence,
  } = useFieldArray({ control, name: "evidence" });

  const pricingModel = watch("pricingModel");
  const acceptsPrice = pricingModel !== "Request information";

  const onSubmit = async (values: FormValues) => {
    const payload = {
      organizationName: values.organizationName,
      name: values.name,
      tagline: values.tagline,
      description: values.description,
      categorySlug: values.categorySlug,
      audienceSlugs: values.audienceSlugs,
      focusSlugs: values.focusSlugs,
      deliveryFormat: values.deliveryFormat,
      serviceArea: values.serviceArea,
      features: values.featuresText
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean),
      evidence: values.evidence,
      pricingModel: values.pricingModel,
      priceFromIdr: acceptsPrice ? values.priceFromIdr : undefined,
      website: values.website,
      brochureUrl: values.brochureUrl,
      videoUrl: values.videoUrl,
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone,
      logo: values.logo,
      logoPublicId: values.logoPublicId,
      coverImage: values.coverImage,
      coverPublicId: values.coverPublicId,
      acceptTerms: values.acceptTerms,
    };
    let parsed;
    if (isEdit) {
      parsed = EditSolutionSchema.safeParse(payload);
    } else {
      parsed = ApplySolutionSchema.safeParse(payload);
    }

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        const target = path === "features" ? "featuresText" : path;
        setError(target as Path<FormValues>, { message: issue.message });
      }
      toast.error("Please check the highlighted fields");
      return;
    }

    setSubmitting(true);
    try {
      let endpoint = "/api/apply/solution";
      let method = "POST";
      if (isEdit) {
        endpoint = `/api/dashboard/solution/${solutionId}`;
        method = "PATCH";
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to submit");

      if (isEdit) {
        toast.success(
          json.data?.requiresReview ? "Saved — back under review" : "Saved",
          { description: json.message },
        );
        router.push("/dashboard/solution");
        router.refresh();
        return;
      }

      router.push("/apply/submitted");
    } catch (err) {
      toast.error("Submission failed", {
        description:
          err instanceof Error ? err.message : "Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">
      <ApplySection
        title="The solution"
        description="How it will be introduced in the directory."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <ApplyField
            label="Organisation name"
            htmlFor="organizationName"
            required
            error={errors.organizationName?.message}
          >
            <input
              id="organizationName"
              {...register("organizationName")}
              className={applyInputClassName(Boolean(errors.organizationName))}
            />
          </ApplyField>

          <ApplyField
            label="Solution name"
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
        </div>

        <ApplyField
          label="One-line summary"
          htmlFor="tagline"
          required
          error={errors.tagline?.message}
        >
          <input
            id="tagline"
            {...register("tagline")}
            className={applyInputClassName(Boolean(errors.tagline))}
          />
        </ApplyField>

        <ApplyField
          label="Description"
          htmlFor="description"
          required
          error={errors.description?.message}
          hint="What it is, who it helps, and what makes it work."
        >
          <textarea
            id="description"
            rows={6}
            {...register("description")}
            className={applyInputClassName(Boolean(errors.description))}
          />
        </ApplyField>
      </ApplySection>

      <ApplySection
        title="Category & audience"
        description="Where it belongs and who it is for."
      >
        <ApplyField
          label="Category"
          htmlFor="categorySlug"
          required
          error={errors.categorySlug?.message}
        >
          <select
            id="categorySlug"
            {...register("categorySlug")}
            className={applyInputClassName(Boolean(errors.categorySlug))}
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </ApplyField>

        <ApplyField
          label="Target users"
          required
          error={errors.audienceSlugs?.message}
        >
          <div className="flex flex-wrap gap-x-5 gap-y-3 rounded-lg border border-border bg-card p-4">
            {audiences.map((audience) => (
              <label
                key={audience.slug}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  value={audience.slug}
                  {...register("audienceSlugs")}
                  className={applyCheckboxClassName}
                />
                {audience.name}
              </label>
            ))}
          </div>
        </ApplyField>

        <ApplyField
          label="Problems addressed"
          required
          error={errors.focusSlugs?.message}
          hint="The concerns this solution helps with."
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
                  {...register("focusSlugs")}
                  className={applyCheckboxClassName}
                />
                {area.name}
              </label>
            ))}
          </div>
        </ApplyField>
      </ApplySection>

      <ApplySection title="Delivery & features">
        <div className="grid gap-5 md:grid-cols-2">
          <ApplyField
            label="Delivery format"
            htmlFor="deliveryFormat"
            required
            error={errors.deliveryFormat?.message}
          >
            <select
              id="deliveryFormat"
              {...register("deliveryFormat")}
              className={applyInputClassName(Boolean(errors.deliveryFormat))}
            >
              {["Online", "In Person", "Hybrid", "Publication", "Product"].map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ),
              )}
            </select>
          </ApplyField>

          <ApplyField
            label="Service area"
            htmlFor="serviceArea"
            required
            error={errors.serviceArea?.message}
            hint="e.g. National, DKI Jakarta, Online worldwide"
          >
            <input
              id="serviceArea"
              {...register("serviceArea")}
              className={applyInputClassName(Boolean(errors.serviceArea))}
            />
          </ApplyField>
        </div>

        <ApplyField
          label="Key features"
          htmlFor="featuresText"
          required
          error={errors.featuresText?.message}
          hint="One feature per line (max 10)."
        >
          <textarea
            id="featuresText"
            rows={5}
            {...register("featuresText")}
            className={applyInputClassName(Boolean(errors.featuresText))}
          />
        </ApplyField>
      </ApplySection>

      <ApplySection
        title="Images"
        description="Optional — they make the listing much easier to recognise. Both are cropped and compressed automatically."
      >
        <ImageUploadField
          label="Logo"
          hint="Square image (512x512 max). JPG/PNG up to 10 MB."
          entityType="solutions"
          aspect={1}
          shape="square"
          maxWidth={512}
          maxHeight={512}
          value={{
            url: watch("logo") || null,
            publicId: watch("logoPublicId") || null,
          }}
          onChange={({ url, publicId }) => {
            setValue("logo", url ?? "", { shouldValidate: true });
            setValue("logoPublicId", publicId ?? "", { shouldValidate: true });
          }}
        />

        <ImageUploadField
          label="Cover image"
          hint="Wide 16:9 image (1600x900 max). Shown on the detail page."
          entityType="solutions"
          aspect={16 / 9}
          shape="wide"
          maxWidth={1600}
          maxHeight={900}
          value={{
            url: watch("coverImage") || null,
            publicId: watch("coverPublicId") || null,
          }}
          onChange={({ url, publicId }) => {
            setValue("coverImage", url ?? "", { shouldValidate: true });
            setValue("coverPublicId", publicId ?? "", { shouldValidate: true });
          }}
        />
      </ApplySection>

      <ApplySection
        title="Evidence"
        description="Optional — certifications, partnerships, or case studies. These are shown as claims from you, not as MindCare verification."
      >
        {errors.evidence?.message ? (
          <p className="text-xs text-destructive">{errors.evidence.message}</p>
        ) : null}
        {evidenceFields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-5 rounded-xl border border-border bg-card p-4 md:grid-cols-[1fr_1fr_auto] md:items-start"
          >
            <ApplyField
              label="What it is"
              htmlFor={`evidence-${index}-label`}
              error={errors.evidence?.[index]?.label?.message}
            >
              <input
                id={`evidence-${index}-label`}
                {...register(`evidence.${index}.label` as const)}
                placeholder="ISO 27001 certified"
                className={applyInputClassName(
                  Boolean(errors.evidence?.[index]?.label),
                )}
              />
            </ApplyField>

            <ApplyField
              label="Link (optional)"
              htmlFor={`evidence-${index}-url`}
              error={errors.evidence?.[index]?.url?.message}
            >
              <input
                id={`evidence-${index}-url`}
                {...register(`evidence.${index}.url` as const)}
                placeholder="https://"
                className={applyInputClassName(
                  Boolean(errors.evidence?.[index]?.url),
                )}
              />
            </ApplyField>

            {evidenceFields.length > 1 ? (
              <button
                type="button"
                onClick={() => removeEvidence(index)}
                className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
                aria-label={`Remove evidence ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            ) : null}
          </div>
        ))}

        {evidenceFields.length < 8 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => appendEvidence({ label: "", url: "" })}
          >
            Add evidence
          </Button>
        ) : null}
      </ApplySection>

      <ApplySection title="Pricing">
        <div className="grid gap-5 md:grid-cols-2">
          <ApplyField
            label="Pricing model"
            htmlFor="pricingModel"
            required
            error={errors.pricingModel?.message}
          >
            <select
              id="pricingModel"
              {...register("pricingModel")}
              className={applyInputClassName(Boolean(errors.pricingModel))}
            >
              {[
                "Free",
                "One-time",
                "Subscription",
                "Tiered",
                "Request information",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </ApplyField>

          {acceptsPrice ? (
            <ApplyField
              label="Starting price (IDR)"
              htmlFor="priceFromIdr"
              error={errors.priceFromIdr?.message}
            >
              <input
                id="priceFromIdr"
                type="number"
                {...register("priceFromIdr", { valueAsNumber: true })}
                className={applyInputClassName(Boolean(errors.priceFromIdr))}
              />
            </ApplyField>
          ) : null}
        </div>
      </ApplySection>

      <ApplySection title="Links & contact">
        <div className="grid gap-5 md:grid-cols-2">
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

          <ApplyField
            label="Brochure URL"
            htmlFor="brochureUrl"
            error={errors.brochureUrl?.message}
            hint="Optional — must start with https://"
          >
            <input
              id="brochureUrl"
              {...register("brochureUrl")}
              placeholder="https://"
              className={applyInputClassName(Boolean(errors.brochureUrl))}
            />
          </ApplyField>

          <ApplyField
            label="Video URL"
            htmlFor="videoUrl"
            error={errors.videoUrl?.message}
            hint="Optional — must start with https://"
          >
            <input
              id="videoUrl"
              {...register("videoUrl")}
              placeholder="https://"
              className={applyInputClassName(Boolean(errors.videoUrl))}
            />
          </ApplyField>

          <ApplyField
            label="Contact email"
            htmlFor="contactEmail"
            required
            error={errors.contactEmail?.message}
          >
            <input
              id="contactEmail"
              type="email"
              {...register("contactEmail")}
              className={applyInputClassName(Boolean(errors.contactEmail))}
            />
          </ApplyField>

          <ApplyField
            label="Contact phone"
            htmlFor="contactPhone"
            error={errors.contactPhone?.message}
          >
            <input
              id="contactPhone"
              {...register("contactPhone")}
              className={applyInputClassName(Boolean(errors.contactPhone))}
            />
          </ApplyField>
        </div>
      </ApplySection>

      <div className="space-y-4">
        {isEdit ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
            Changing the organisation name, solution name, or category sends
            this listing back for review and hides it from the directory until
            it is approved again. Everything else saves immediately.
          </p>
        ) : (
          <>
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
                I confirm the information above is accurate and I am authorised
                to list this solution.
              </span>
            </label>
            {errors.acceptTerms?.message ? (
              <p className="text-xs text-destructive">
                {errors.acceptTerms.message}
              </p>
            ) : null}
          </>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full"
        >
          {submitLabel(submitting, isEdit)}
        </Button>
      </div>
    </form>
  );
}

/** Label tombol tanpa operator ternary di JSX. */
function submitLabel(submitting: boolean, isEdit: boolean): string {
  if (submitting) return "Saving...";
  if (isEdit) return "Save changes";
  return "Submit your solution";
}
