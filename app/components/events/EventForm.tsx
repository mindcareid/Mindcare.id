"use client";

import { useMemo, useState } from "react";
import {
  EventFormat,
  EventPublisherType,
  EventRegistrationType,
  EventStatus,
} from "@prisma/client";
import { toast } from "sonner";

type CategoryOption = {
  id: number;
  name: string;
  slug: string;
};

type FocusAreaOption = {
  id: number;
  name: string;
  slug: string;
};

type OrganizerOption = {
  id: number;
  name: string;
  type: EventPublisherType;
};

type AgendaItemInput = {
  id?: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  sortOrder: number;
};

type EventFormContext =
  | "admin"
  | "professional"
  | "care-centre"
  | "solution";

type EventFormMode = "create" | "edit";

type EventFormInitialData = {
  id?: number;

  title: string;
  slug?: string;
  description: string;

  location: string;
  format: EventFormat;

  startDate: string;
  endDate: string;
  timeZone: string;

  price: number;
  currency: string;
  quota: number | null;

  externalUrl: string;
  registrationType: EventRegistrationType;

  coverImage: string;

  publisherType: EventPublisherType;

  professionalId: number | null;
  careCentreId: number | null;
  solutionId: number | null;

  categoryId: number;

  focusAreaIds: number[];

  agenda: AgendaItemInput[];

  status: EventStatus;
};

type EventFormProps = {
  mode?: EventFormMode;
  context: EventFormContext;

  categories: CategoryOption[];
  focusAreas: FocusAreaOption[];

  organizers?: OrganizerOption[];

  ownerId?: number;

  initialData?: EventFormInitialData;

  onSuccess?: (eventId: number) => void;
};

const DEFAULT_TIME_ZONE = "Asia/Jakarta";

const EMPTY_FORM: EventFormInitialData = {
  title: "",
  description: "",

  location: "",
  format: EventFormat.IN_PERSON,

  startDate: "",
  endDate: "",
  timeZone: DEFAULT_TIME_ZONE,

  price: 0,
  currency: "IDR",
  quota: null,

  externalUrl: "",
  registrationType: EventRegistrationType.INTERNAL,

  coverImage: "",

  publisherType: EventPublisherType.PLATFORM,

  professionalId: null,
  careCentreId: null,
  solutionId: null,

  categoryId: 0,

  focusAreaIds: [],

  agenda: [],

  status: EventStatus.DRAFT,
};

function createAgendaItem(sortOrder: number): AgendaItemInput {
  return {
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    sortOrder,
  };
}

function getDefaultPublisherType(
  context: EventFormContext,
): EventPublisherType {
  switch (context) {
    case "professional":
      return EventPublisherType.PROFESSIONAL;

    case "care-centre":
      return EventPublisherType.CARE_CENTRE;

    case "solution":
      return EventPublisherType.SOLUTION;

    default:
      return EventPublisherType.PLATFORM;
  }
}

function getInitialForm(
  context: EventFormContext,
  initialData?: EventFormInitialData,
): EventFormInitialData {
  if (initialData) {
    return {
      ...EMPTY_FORM,
      ...initialData,
    };
  }

  return {
    ...EMPTY_FORM,
    publisherType: getDefaultPublisherType(context),
  };
}

export default function EventForm({
  mode = "create",
  context,
  categories,
  focusAreas,
  organizers = [],
  ownerId,
  initialData,
  onSuccess,
}: EventFormProps) {
  const [form, setForm] = useState<EventFormInitialData>(() =>
    getInitialForm(context, initialData),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = context === "admin";
  const isEdit = mode === "edit";

  const selectedOrganizer = useMemo(() => {
    if (!isAdmin) {
      return null;
    }

    return organizers.find(
      (organizer) =>
        organizer.type === form.publisherType &&
        organizer.id ===
          (form.publisherType === EventPublisherType.PROFESSIONAL
            ? form.professionalId
            : form.publisherType === EventPublisherType.CARE_CENTRE
              ? form.careCentreId
              : form.publisherType === EventPublisherType.SOLUTION
                ? form.solutionId
                : null),
    );
  }, [
    form.publisherType,
    form.professionalId,
    form.careCentreId,
    form.solutionId,
    isAdmin,
    organizers,
  ]);

  function updateField<K extends keyof EventFormInitialData>(
    field: K,
    value: EventFormInitialData[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handlePublisherTypeChange(
    publisherType: EventPublisherType,
  ) {
    setForm((current) => ({
      ...current,
      publisherType,
      professionalId: null,
      careCentreId: null,
      solutionId: null,
    }));
  }

  function toggleFocusArea(id: number) {
    setForm((current) => {
      const exists = current.focusAreaIds.includes(id);

      return {
        ...current,
        focusAreaIds: exists
          ? current.focusAreaIds.filter(
              (focusAreaId) => focusAreaId !== id,
            )
          : [...current.focusAreaIds, id],
      };
    });
  }

  function addAgendaItem() {
    setForm((current) => ({
      ...current,
      agenda: [
        ...current.agenda,
        createAgendaItem(current.agenda.length),
      ],
    }));
  }

  function updateAgendaItem(
    index: number,
    field: keyof AgendaItemInput,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      agenda: current.agenda.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  }

  function removeAgendaItem(index: number) {
    setForm((current) => ({
      ...current,
      agenda: current.agenda
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          sortOrder: itemIndex,
        })),
    }));
  }

  function validate(): string | null {
    if (!form.title.trim()) {
      return "Event title is required.";
    }

    if (!form.description.trim()) {
      return "Event description is required.";
    }

    if (!form.categoryId) {
      return "Please select an event category.";
    }

    if (!form.startDate) {
      return "Start date is required.";
    }

    if (!form.endDate) {
      return "End date is required.";
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    if (Number.isNaN(start.getTime())) {
      return "Invalid start date.";
    }

    if (Number.isNaN(end.getTime())) {
      return "Invalid end date.";
    }

    if (end <= start) {
      return "End date must be after the start date.";
    }

    if (form.price < 0) {
      return "Price cannot be negative.";
    }

    if (
      form.quota !== null &&
      (!Number.isInteger(form.quota) || form.quota <= 0)
    ) {
      return "Quota must be a positive whole number.";
    }

    if (
      form.registrationType === EventRegistrationType.EXTERNAL &&
      !form.externalUrl.trim()
    ) {
      return "External registration URL is required.";
    }

    if (
      form.externalUrl &&
      !/^https?:\/\/.+/i.test(form.externalUrl)
    ) {
      return "External registration URL must be a valid URL.";
    }

    for (const agenda of form.agenda) {
      if (!agenda.title.trim()) {
        return "Every agenda item must have a title.";
      }

      if (!agenda.startTime || !agenda.endTime) {
        return "Every agenda item must have a start and end time.";
      }

      if (agenda.endTime <= agenda.startTime) {
        return "Agenda end time must be after start time.";
      }
    }

    if (isAdmin) {
      if (
        form.publisherType === EventPublisherType.PROFESSIONAL &&
        !form.professionalId
      ) {
        return "Please select a professional.";
      }

      if (
        form.publisherType === EventPublisherType.CARE_CENTRE &&
        !form.careCentreId
      ) {
        return "Please select a care centre.";
      }

      if (
        form.publisherType === EventPublisherType.SOLUTION &&
        !form.solutionId
      ) {
        return "Please select a solution.";
      }
    }

    if (!isAdmin && !ownerId) {
      return "The event owner could not be determined.";
    }

    return null;
  }

  async function handleSubmit(
    status: EventStatus,
  ) {
    const error = validate();

    if (error) {
      toast.error(error);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),

        location: form.location.trim() || null,
        format: form.format,

        startDate: form.startDate,
        endDate: form.endDate,
        timeZone: form.timeZone,

        price: form.price,
        currency: form.currency,
        quota: form.quota,

        externalUrl: form.externalUrl.trim() || null,
        registrationType: form.registrationType,

        coverImage: form.coverImage.trim() || null,

        publisherType: form.publisherType,

        professionalId: form.professionalId,
        careCentreId: form.careCentreId,
        solutionId: form.solutionId,

        categoryId: form.categoryId,

        focusAreaIds: form.focusAreaIds,

        agenda: form.agenda.map((item, index) => ({
          ...item,
          sortOrder: index,
        })),

        status,

        ...(ownerId
          ? {
              ownerId,
            }
          : {}),
      };

      const url = isEdit
        ? `/api/events/${form.id}`
        : "/api/events";

      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result: {
        success?: boolean;
        message?: string;
        data?: {
          id: number;
        };
      } = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to save event.",
        );
      }

      toast.success(
        status === EventStatus.PUBLISHED
          ? "Event published successfully."
          : "Event saved as draft.",
      );

      if (result.data?.id && onSuccess) {
        onSuccess(result.data.id);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the event.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(EventStatus.DRAFT);
      }}
      className="space-y-8"
    >
      {/* ======================================================
          ORGANIZER
      ======================================================= */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Event Organizer
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Choose who is publishing this event.
          </p>
        </div>

        {!isAdmin ? (
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-sm font-medium">
              {form.publisherType ===
                EventPublisherType.PROFESSIONAL &&
                "Professional"}

              {form.publisherType ===
                EventPublisherType.CARE_CENTRE &&
                "Care Centre"}

              {form.publisherType ===
                EventPublisherType.SOLUTION &&
                "Solution"}

              {form.publisherType ===
                EventPublisherType.PLATFORM &&
                "MindCare Platform"}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              The organizer is automatically assigned from
              your account.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-2">
              <label
                htmlFor="publisherType"
                className="text-sm font-medium"
              >
                Publisher
              </label>

              <select
                id="publisherType"
                value={form.publisherType}
                disabled={isEdit}
                onChange={(event) =>
                  handlePublisherTypeChange(
                    event.target.value as EventPublisherType,
                  )
                }
                className="h-11 rounded-lg border bg-background px-3 text-sm"
              >
                <option value={EventPublisherType.PLATFORM}>
                  MindCare Platform
                </option>

                <option value={EventPublisherType.PROFESSIONAL}>
                  Professional
                </option>

                <option value={EventPublisherType.CARE_CENTRE}>
                  Care Centre
                </option>

                <option value={EventPublisherType.SOLUTION}>
                  Solution
                </option>
              </select>
            </div>

            {form.publisherType !==
              EventPublisherType.PLATFORM && (
              <div className="grid gap-2">
                <label
                  htmlFor="organizer"
                  className="text-sm font-medium"
                >
                  Organizer
                </label>

                <select
                  id="organizer"
                  value={
                    form.publisherType ===
                    EventPublisherType.PROFESSIONAL
                      ? (form.professionalId ?? "")
                      : form.publisherType ===
                          EventPublisherType.CARE_CENTRE
                        ? (form.careCentreId ?? "")
                        : (form.solutionId ?? "")
                  }
                  onChange={(event) => {
                    const value = event.target.value
                      ? Number(event.target.value)
                      : null;

                    if (
                      form.publisherType ===
                      EventPublisherType.PROFESSIONAL
                    ) {
                      updateField("professionalId", value);
                    }

                    if (
                      form.publisherType ===
                      EventPublisherType.CARE_CENTRE
                    ) {
                      updateField("careCentreId", value);
                    }

                    if (
                      form.publisherType ===
                      EventPublisherType.SOLUTION
                    ) {
                      updateField("solutionId", value);
                    }
                  }}
                  className="h-11 rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="">
                    Select organizer
                  </option>

                  {organizers
                    .filter(
                      (organizer) =>
                        organizer.type === form.publisherType,
                    )
                    .map((organizer) => (
                      <option
                        key={organizer.id}
                        value={organizer.id}
                      >
                        {organizer.name}
                      </option>
                    ))}
                </select>

                {selectedOrganizer && (
                  <p className="text-xs text-muted-foreground">
                    Publishing as {selectedOrganizer.name}.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ======================================================
          EVENT INFORMATION
      ======================================================= */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Event Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Provide the main information about your event.
          </p>
        </div>

        <div className="space-y-5">
          <div className="grid gap-2">
            <label
              htmlFor="title"
              className="text-sm font-medium"
            >
              Event title
            </label>

            <input
              id="title"
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              placeholder="e.g. Managing Workplace Anxiety"
              className="h-11 rounded-lg border px-3 text-sm"
              maxLength={255}
              required
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="category"
              className="text-sm font-medium"
            >
              Category
            </label>

            <select
              id="category"
              value={form.categoryId || ""}
              onChange={(event) =>
                updateField(
                  "categoryId",
                  Number(event.target.value),
                )
              }
              className="h-11 rounded-lg border bg-background px-3 text-sm"
              required
            >
              <option value="">
                Select category
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="description"
              className="text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              placeholder="Describe what participants can expect from this event."
              rows={7}
              className="resize-y rounded-lg border px-3 py-3 text-sm"
              required
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="coverImage"
              className="text-sm font-medium"
            >
              Cover image URL
            </label>

            <input
              id="coverImage"
              type="url"
              value={form.coverImage}
              onChange={(event) =>
                updateField(
                  "coverImage",
                  event.target.value,
                )
              }
              placeholder="https://..."
              className="h-11 rounded-lg border px-3 text-sm"
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          SCHEDULE
      ======================================================= */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Schedule & Location
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Set when and where the event takes place.
          </p>
        </div>

        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="startDate"
                className="text-sm font-medium"
              >
                Start date & time
              </label>

              <input
                id="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={(event) =>
                  updateField(
                    "startDate",
                    event.target.value,
                  )
                }
                className="h-11 rounded-lg border px-3 text-sm"
                required
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="endDate"
                className="text-sm font-medium"
              >
                End date & time
              </label>

              <input
                id="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={(event) =>
                  updateField(
                    "endDate",
                    event.target.value,
                  )
                }
                className="h-11 rounded-lg border px-3 text-sm"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="timeZone"
              className="text-sm font-medium"
            >
              Time zone
            </label>

            <select
              id="timeZone"
              value={form.timeZone}
              onChange={(event) =>
                updateField(
                  "timeZone",
                  event.target.value,
                )
              }
              className="h-11 rounded-lg border bg-background px-3 text-sm"
            >
              <option value="Asia/Jakarta">
                Asia/Jakarta — WIB
              </option>

              <option value="Asia/Makassar">
                Asia/Makassar — WITA
              </option>

              <option value="Asia/Jayapura">
                Asia/Jayapura — WIT
              </option>

              <option value="Asia/Singapore">
                Asia/Singapore
              </option>

              <option value="Asia/Kuala_Lumpur">
                Asia/Kuala Lumpur
              </option>
            </select>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="format"
              className="text-sm font-medium"
            >
              Event format
            </label>

            <select
              id="format"
              value={form.format}
              onChange={(event) =>
                updateField(
                  "format",
                  event.target.value as EventFormat,
                )
              }
              className="h-11 rounded-lg border bg-background px-3 text-sm"
            >
              <option value={EventFormat.IN_PERSON}>
                In person
              </option>

              <option value={EventFormat.ONLINE}>
                Online
              </option>

              <option value={EventFormat.HYBRID}>
                Hybrid
              </option>
            </select>
          </div>

          {form.format !== EventFormat.ONLINE && (
            <div className="grid gap-2">
              <label
                htmlFor="location"
                className="text-sm font-medium"
              >
                Location
              </label>

              <input
                id="location"
                value={form.location}
                onChange={(event) =>
                  updateField(
                    "location",
                    event.target.value,
                  )
                }
                placeholder="e.g. Jakarta Convention Center"
                className="h-11 rounded-lg border px-3 text-sm"
              />
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          REGISTRATION
      ======================================================= */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Registration
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure ticket price and registration.
          </p>
        </div>

        <div className="space-y-5">
          <div className="grid gap-2">
            <label
              htmlFor="registrationType"
              className="text-sm font-medium"
            >
              Registration type
            </label>

            <select
              id="registrationType"
              value={form.registrationType}
              onChange={(event) =>
                updateField(
                  "registrationType",
                  event.target.value as EventRegistrationType,
                )
              }
              className="h-11 rounded-lg border bg-background px-3 text-sm"
            >
              <option value={EventRegistrationType.INTERNAL}>
                Register on MindCare
              </option>

              <option value={EventRegistrationType.EXTERNAL}>
                External registration
              </option>
            </select>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="price"
                className="text-sm font-medium"
              >
                Price
              </label>

              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 bg-muted px-3 text-sm">
                  IDR
                </span>

                <input
                  id="price"
                  type="number"
                  min={0}
                  step={1000}
                  value={form.price}
                  onChange={(event) =>
                    updateField(
                      "price",
                      Number(event.target.value),
                    )
                  }
                  className="h-11 w-full rounded-r-lg border px-3 text-sm"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Use 0 for a free event.
              </p>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="quota"
                className="text-sm font-medium"
              >
                Participant quota
              </label>

              <input
                id="quota"
                type="number"
                min={1}
                step={1}
                value={form.quota ?? ""}
                onChange={(event) => {
                  const value = event.target.value;

                  updateField(
                    "quota",
                    value === ""
                      ? null
                      : Number(value),
                  );
                }}
                placeholder="Unlimited"
                className="h-11 rounded-lg border px-3 text-sm"
              />

              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited capacity.
              </p>
            </div>
          </div>

          {form.registrationType ===
            EventRegistrationType.EXTERNAL && (
            <div className="grid gap-2">
              <label
                htmlFor="externalUrl"
                className="text-sm font-medium"
              >
                Registration URL
              </label>

              <input
                id="externalUrl"
                type="url"
                value={form.externalUrl}
                onChange={(event) =>
                  updateField(
                    "externalUrl",
                    event.target.value,
                  )
                }
                placeholder="https://example.com/register"
                className="h-11 rounded-lg border px-3 text-sm"
              />
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          FOCUS AREAS
      ======================================================= */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Focus Areas
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select the topics covered by this event.
          </p>
        </div>

        {focusAreas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No focus areas are available.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((focusArea) => {
              const selected =
                form.focusAreaIds.includes(focusArea.id);

              return (
                <button
                  key={focusArea.id}
                  type="button"
                  onClick={() =>
                    toggleFocusArea(focusArea.id)
                  }
                  className={[
                    "rounded-full border px-4 py-2 text-sm transition",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted",
                  ].join(" ")}
                >
                  {focusArea.name}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ======================================================
          AGENDA
      ======================================================= */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Agenda
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add the planned sessions for this event.
            </p>
          </div>

          <button
            type="button"
            onClick={addAgendaItem}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            + Add session
          </button>
        </div>

        {form.agenda.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No agenda items yet.
            </p>

            <button
              type="button"
              onClick={addAgendaItem}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Add the first session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {form.agenda.map((item, index) => (
              <div
                key={item.id ?? `agenda-${index}`}
                className="rounded-xl border p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    Session {index + 1}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      removeAgendaItem(index)
                    }
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Title
                    </label>

                    <input
                      value={item.title}
                      onChange={(event) =>
                        updateAgendaItem(
                          index,
                          "title",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. Opening Session"
                      className="h-11 rounded-lg border px-3 text-sm"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">
                        Start
                      </label>

                      <input
                        type="time"
                        value={item.startTime}
                        onChange={(event) =>
                          updateAgendaItem(
                            index,
                            "startTime",
                            event.target.value,
                          )
                        }
                        className="h-11 rounded-lg border px-3 text-sm"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">
                        End
                      </label>

                      <input
                        type="time"
                        value={item.endTime}
                        onChange={(event) =>
                          updateAgendaItem(
                            index,
                            "endTime",
                            event.target.value,
                          )
                        }
                        className="h-11 rounded-lg border px-3 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Description
                    </label>

                    <textarea
                      value={item.description}
                      onChange={(event) =>
                        updateAgendaItem(
                          index,
                          "description",
                          event.target.value,
                        )
                      }
                      rows={3}
                      placeholder="Optional session description"
                      className="resize-y rounded-lg border px-3 py-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ======================================================
          ACTIONS
      ======================================================= */}

      <div className="sticky bottom-0 z-20 -mx-4 border-t bg-background/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : "Save Draft"}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() =>
              void handleSubmit(EventStatus.PUBLISHED)
            }
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Publishing..."
              : isEdit
                ? "Update & Publish"
                : "Publish Event"}
          </button>
        </div>
      </div>
    </form>
  );
}