"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Path } from "react-hook-form";
import { toast } from "sonner";
import { CreateEventSchema } from "@/lib/validations/auth";
import Button from "@/app/components/reusable/Button";
import ImageUploadField from "@/app/components/reusable/ImageUploadField";
import {
  ApplyField,
  ApplySection,
  applyInputClassName,
} from "@/app/apply/component/ApplyField";

type FormValues = {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  price: number;
  quota: string;
  externalUrl: string;
  categoryId: string;
  coverUrl: string;
  coverPublicId: string;
  industryIds: string[];
  listingIndex: number;
};

const DEFAULT_TZ = "Asia/Jakarta";

type EventData = {
  id: number;
  title: string;
  description: string;
  location: string | null;
  startDate: Date;
  endDate: Date;
  timeZone: string;
  price: number;
  quota: number | null;
  externalUrl: string | null;
  coverImage: string | null;
  publicId: string | null;
  categoryId: number;
  industries: { industryId: number }[];
};

function toDatetimeLocal(value: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(
    value.getDate(),
  )}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export default function CreateEventForm({
  type,
  listingId,
  categories,
  industries,
  event,
}: {
  type?: "professional" | "care-centre" | "solution";
  listingId?: number;
  categories: { id: number; name: string }[];
  industries: { id: number; name: string }[];
  event?: EventData;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(event);

  const defaultValues: FormValues = event
    ? {
        title: event.title,
        description: event.description,
        location: event.location ?? "",
        startDate: toDatetimeLocal(event.startDate),
        endDate: toDatetimeLocal(event.endDate),
        timeZone: event.timeZone,
        price: event.price,
        quota: event.quota?.toString() ?? "",
        externalUrl: event.externalUrl ?? "",
        categoryId: event.categoryId.toString(),
        coverUrl: event.coverImage ?? "",
        coverPublicId: event.publicId ?? "",
        industryIds: event.industries.map((i) => i.industryId.toString()),
        listingIndex: 0,
      }
    : {
        title: "",
        description: "",
        location: "",
        startDate: "",
        endDate: "",
        timeZone: DEFAULT_TZ,
        price: 0,
        quota: "",
        externalUrl: "",
        categoryId: categories[0]?.id.toString() ?? "",
        coverUrl: "",
        coverPublicId: "",
        industryIds: [],
        listingIndex: 0,
      };

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    mode: "onTouched",
  });

  const coverUrl = watch("coverUrl");
  const coverPublicId = watch("coverPublicId");

  const onSubmit = async (values: FormValues) => {
    const payload = {
      title: values.title,
      description: values.description,
      location: values.location || null,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      timeZone: values.timeZone,
      price: values.price,
      quota: values.quota === "" ? null : Number(values.quota),
      externalUrl: values.externalUrl || null,
      categoryId: Number(values.categoryId),
      coverImage: coverUrl || null,
      publicId: coverPublicId || null,
      industryIds: values.industryIds.map(Number),
      listingIndex: 0,
    };

    const parsed = CreateEventSchema.safeParse(payload);
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
      let endpoint = "/api/listing/events";
      let method = "POST";
      if (isEdit && event) {
        endpoint = `/api/listing/events/${event.id}`;
        method = "PATCH";
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.message ||
            (isEdit ? "Failed to update event" : "Failed to create event"),
        );
      }

      toast.success(isEdit ? "Event updated" : "Event published");
      router.push("/dashboard/events");
      router.refresh();
    } catch (err) {
      toast.error(
        isEdit ? "Could not update event" : "Could not create event",
        {
          description: err instanceof Error ? err.message : "Please try again.",
        },
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      <ApplySection title="Event details">
        <ApplyField
          label="Title"
          htmlFor="title"
          required
          error={errors.title?.message}
        >
          <input
            id="title"
            {...register("title")}
            className={applyInputClassName(Boolean(errors.title))}
          />
        </ApplyField>

        <ApplyField
          label="Description"
          htmlFor="description"
          required
          error={errors.description?.message}
        >
          <textarea
            id="description"
            rows={5}
            {...register("description")}
            className={applyInputClassName(Boolean(errors.description))}
          />
        </ApplyField>

        <div className="grid gap-5 md:grid-cols-2">
          <ApplyField
            label="Start date & time"
            htmlFor="startDate"
            required
            error={errors.startDate?.message}
          >
            <input
              id="startDate"
              type="datetime-local"
              {...register("startDate")}
              className={applyInputClassName(Boolean(errors.startDate))}
            />
          </ApplyField>

          <ApplyField
            label="End date & time"
            htmlFor="endDate"
            required
            error={errors.endDate?.message}
          >
            <input
              id="endDate"
              type="datetime-local"
              {...register("endDate")}
              className={applyInputClassName(Boolean(errors.endDate))}
            />
          </ApplyField>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ApplyField
            label="Location"
            htmlFor="location"
            error={errors.location?.message}
            hint="Physical venue or leave blank for online"
          >
            <input
              id="location"
              {...register("location")}
              className={applyInputClassName(Boolean(errors.location))}
            />
          </ApplyField>

          <ApplyField
            label="Time zone"
            htmlFor="timeZone"
            error={errors.timeZone?.message}
          >
            <select
              id="timeZone"
              {...register("timeZone")}
              className={applyInputClassName(Boolean(errors.timeZone))}
            >
              <option value="Asia/Jakarta">WIB — Jakarta</option>
              <option value="Asia/Makassar">WITA — Makassar</option>
              <option value="Asia/Jayapura">WIT — Jayapura</option>
            </select>
          </ApplyField>
        </div>

        <ApplyField
          label="Category"
          htmlFor="categoryId"
          required
          error={errors.categoryId?.message}
        >
          <select
            id="categoryId"
            {...register("categoryId")}
            className={applyInputClassName(Boolean(errors.categoryId))}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </ApplyField>
      </ApplySection>

      <ApplySection
        title="Cover image"
        description="Optional — wide 16:9 image for the event card and detail page."
      >
        <ImageUploadField
          label="Cover"
          hint="16:9 image (1600×900 max), WebP — normally under 100 KB."
          entityType="events"
          aspect={16 / 9}
          shape="wide"
          maxWidth={1600}
          maxHeight={900}
          value={{ url: coverUrl || null, publicId: coverPublicId || null }}
          onChange={({ url, publicId }) => {
            setValue("coverUrl", url ?? "", { shouldValidate: true });
            setValue("coverPublicId", publicId ?? "", { shouldValidate: true });
          }}
        />
      </ApplySection>

      <ApplySection title="Ticket & registration">
        <div className="grid gap-5 md:grid-cols-2">
          <ApplyField
            label="Price (IDR)"
            htmlFor="price"
            error={errors.price?.message}
          >
            <input
              id="price"
              type="number"
              {...register("price", { valueAsNumber: true })}
              className={applyInputClassName(Boolean(errors.price))}
            />
          </ApplyField>

          <ApplyField
            label="Quota"
            htmlFor="quota"
            error={errors.quota?.message}
            hint="Leave empty for unlimited"
          >
            <input
              id="quota"
              type="number"
              {...register("quota")}
              className={applyInputClassName(Boolean(errors.quota))}
            />
          </ApplyField>
        </div>

        <ApplyField
          label="Registration URL"
          htmlFor="externalUrl"
          error={errors.externalUrl?.message}
          hint="Optional — use an external ticketing platform"
        >
          <input
            id="externalUrl"
            placeholder="https://"
            {...register("externalUrl")}
            className={applyInputClassName(Boolean(errors.externalUrl))}
          />
        </ApplyField>
      </ApplySection>

      <ApplySection
        title="Industries"
        description="Optional — target industries."
      >
        <div className="flex flex-wrap gap-x-5 gap-y-3 rounded-lg border border-border bg-card p-4">
          {industries.map((ind) => (
            <label
              key={ind.id}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <input
                type="checkbox"
                value={ind.id}
                {...register("industryIds")}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              {ind.name}
            </label>
          ))}
        </div>
      </ApplySection>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={saving}>
          {isEdit
            ? saving
              ? "Saving..."
              : "Save changes"
            : saving
              ? "Publishing..."
              : "Publish event"}
        </Button>
      </div>
    </form>
  );
}
