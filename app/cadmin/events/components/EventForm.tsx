"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { autoSlug } from "@/lib/utils/autoSlug";
import { toEventPlainText } from "@/lib/events/serializers";
import { fromUtcFormat } from "@/lib/date";
import ImageUploadField from "@/app/components/reusable/ImageUploadField";
import PdfUploadField from "@/app/components/reusable/PdfUploadField";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import AgendaSpeakersEditor, {
  type AgendaDraft,
  type SpeakerDraft,
} from "./AgendaSpeakersEditor";
import WorkshopsEditor, { type WorkshopDraft } from "./WorkshopsEditor";
import { agendaKindHidesSpeakers } from "@/lib/events/agenda";

/* ================= TYPES ================= */

type EventFormProps = {
  id?: number;
  defaultValues?: Partial<EventFormFields>;
  categories: { id: number; name: string }[];
};

type AgendaDefault = {
  id: number;
  kind: string;
  title: string;
  description?: string | null;
  attendees?: string | null;
  startTime: string;
  endTime: string;
  speakers?: { speakerId: number; role: string }[];
};

type SpeakerDefault = {
  id: number;
  name: string;
  title?: string | null;
  titleLines?: string | null;
  photoUrl?: string | null;
  photoPublicId?: string | null;
};

type WorkshopDefault = {
  id: number;
  speakerId: number;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  price?: string | null;
  link: string;
};

type EventFormFields = {
  title: string;
  slug: string;
  description: string;
  location?: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  price: number;
  quota?: number;
  coverImage?: string;
  publicId?: string;
  proposalUrl?: string | null;
  proposalPublicId?: string | null;
  isPublished: boolean;
  categoryId: number;
  publisherType?: string;
  workshopNote?: string | null;
  agenda?: AgendaDefault[];
  speakers?: SpeakerDefault[];
  workshops?: WorkshopDefault[];
};

/* ================= MAPPERS ================= */

function mapWorkshops(
  values: Partial<EventFormFields> | undefined,
  tz: string,
): WorkshopDraft[] {
  return (values?.workshops ?? []).map((item) => ({
    key: `workshop-${item.id}`,
    id: item.id,
    speakerKey: String(item.speakerId),
    title: item.title,
    description: item.description ?? "",
    date: fromUtcFormat(item.startTime, tz).slice(0, 10),
    startTime: fromUtcFormat(item.startTime, tz).slice(11, 16),
    endTime: fromUtcFormat(item.endTime, tz).slice(11, 16),
    price: item.price ?? "",
    link: item.link,
  }));
}

/** `defaultValues` -> state form. Satu sumber untuk init dan muat ulang. */
function mapSpeakers(values?: Partial<EventFormFields>): SpeakerDraft[] {
  return (values?.speakers ?? []).map((speaker) => ({
    key: String(speaker.id),
    name: speaker.name,
    title: speaker.title ?? "",
    titleLines: speaker.titleLines ?? "",
    photoUrl: speaker.photoUrl ?? "",
    photoPublicId: speaker.photoPublicId ?? "",
  }));
}

function mapAgenda(
  values: Partial<EventFormFields> | undefined,
  tz: string,
): AgendaDraft[] {
  return (values?.agenda ?? []).map((item) => ({
    key: `agenda-${item.id}`,
    id: item.id,
    kind: item.kind as AgendaDraft["kind"],
    title: item.title,
    description: item.description ?? "",
    attendees: item.attendees ?? "",
    date: fromUtcFormat(item.startTime, tz).slice(0, 10),
    startTime: fromUtcFormat(item.startTime, tz).slice(11, 16),
    endTime: fromUtcFormat(item.endTime, tz).slice(11, 16),
    speakers: (item.speakers ?? []).map((link) => ({
      key: String(link.speakerId),
      role: link.role as AgendaDraft["speakers"][number]["role"],
    })),
  }));
}

export default function EventFormWrapper(props: EventFormProps) {
  // Penanda isi data server; berubah setelah simpan atau refetch.
  const revision = [
    props.id ?? "new",
    props.defaultValues?.startDate ?? "",
    props.defaultValues?.speakers?.length ?? 0,
    (props.defaultValues?.agenda ?? [])
      .map((item) => `${item.id}:${item.speakers?.length ?? 0}`)
      .join(","),
    props.defaultValues?.workshops?.length ?? 0,
  ].join("|");

  return <EventForm key={revision} {...props} />;
}

function EventForm({ id, defaultValues, categories }: EventFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const discarded = useRef<Set<string>>(new Set());
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [openCard, setOpenCard] = useState<string | null>(null);
  const [issues, setIssues] = useState<{ cardKey: string; message: string }[]>(
    [],
  );
  const tz = defaultValues?.timeZone ?? "Asia/Jakarta";

  const [form, setForm] = useState<EventFormFields>(() => ({
    title: defaultValues?.title ?? "",
    slug: defaultValues?.slug ?? "",
    description: toEventPlainText(defaultValues?.description ?? ""),
    location: defaultValues?.location ?? "",
    startDate: defaultValues?.startDate
      ? fromUtcFormat(defaultValues.startDate, tz)
      : "",
    endDate: defaultValues?.endDate
      ? fromUtcFormat(defaultValues.endDate, tz)
      : "",
    timeZone: tz,
    price: defaultValues?.price ?? 0,
    quota: defaultValues?.quota ?? undefined,
    coverImage: defaultValues?.coverImage ?? "",
    publicId: defaultValues?.publicId ?? "",
    proposalUrl: defaultValues?.proposalUrl ?? "",
    proposalPublicId: defaultValues?.proposalPublicId ?? "",
    isPublished: defaultValues?.isPublished ?? false,
    categoryId: Number(defaultValues?.categoryId ?? categories[0]?.id ?? 0),
    publisherType: defaultValues?.publisherType ?? "PLATFORM",
    workshopNote: defaultValues?.workshopNote ?? "",
  }));

  // Speaker, agenda, dan workshop hanya untuk event MindCare (publisher PLATFORM).
  const [speakers, setSpeakers] = useState<SpeakerDraft[]>(() =>
    mapSpeakers(defaultValues),
  );

  const [agenda, setAgenda] = useState<AgendaDraft[]>(() =>
    mapAgenda(defaultValues, tz),
  );

  const [workshops, setWorkshops] = useState<WorkshopDraft[]>(() =>
    mapWorkshops(defaultValues, tz),
  );

  const applyServerEvent = (server: Partial<EventFormFields>) => {
    const serverTz = server.timeZone ?? tz;

    setForm({
      title: server.title ?? "",
      slug: server.slug ?? "",
      description: toEventPlainText(server.description ?? ""),
      location: server.location ?? "",
      startDate: server.startDate
        ? fromUtcFormat(server.startDate, serverTz)
        : "",
      endDate: server.endDate ? fromUtcFormat(server.endDate, serverTz) : "",
      timeZone: serverTz,
      price: server.price ?? 0,
      quota: server.quota ?? undefined,
      coverImage: server.coverImage ?? "",
      publicId: server.publicId ?? "",
      proposalUrl: server.proposalUrl ?? "",
      proposalPublicId: server.proposalPublicId ?? "",
      isPublished: server.isPublished ?? false,
      categoryId: Number(server.categoryId ?? form.categoryId),
      publisherType: server.publisherType ?? "PLATFORM",
      workshopNote: server.workshopNote ?? "",
    });

    setSpeakers(mapSpeakers(server));
    setAgenda(mapAgenda(server, serverTz));
    setWorkshops(mapWorkshops(server, serverTz));
    setOpenCard(null);
  };

  /* ================= HANDLERS ================= */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : ["price", "quota", "categoryId"].includes(name)
            ? Number(value)
            : value,
    }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      title: value,
      slug: autoSlug({
        value,
        currentSlug: prev.slug,
        isEdit: !!id,
      }),
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventFirstDay = form.startDate.slice(0, 10);
    const eventLastDay = form.endDate.slice(0, 10);

    if (!form.startDate || !form.endDate) {
      setIssues([
        {
          cardKey: "event-dates",
          message: "Fill in both the event start and end date.",
        },
      ]);
      return;
    }

    if (form.endDate < form.startDate) {
      setIssues([
        {
          cardKey: "event-dates",
          message: `The event ends (${form.endDate.replace("T", " ")}) before it starts (${form.startDate.replace("T", " ")}). Fix the event start/end date first — sessions can only fall inside that range.`,
        },
      ]);
      requestAnimationFrame(() => {
        document
          .getElementById("event-dates")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    if ((form.publisherType ?? "PLATFORM") === "PLATFORM") {
      const found: { cardKey: string; message: string }[] = [];
      speakers.forEach((speaker, index) => {
        if (!speaker.name.trim()) {
          found.push({
            cardKey: `speaker-${speaker.key}`,
            message: `Speaker ${index + 1}: name is required.`,
          });
        }
      });

      agenda.forEach((item, index) => {
        const cardKey = `agenda-${item.key}`;

        if (!item.title.trim() || !item.startTime || !item.endTime) {
          found.push({
            cardKey,
            message: `Session ${index + 1}: title, start, and end time are required.`,
          });
          return;
        }
        if (
          agendaKindHidesSpeakers(item.kind) &&
          !item.attendees.trim() &&
          !item.description.trim()
        ) {
          found.push({
            cardKey,
            message: `Session ${index + 1}: add a line describing who or what fills it.`,
          });
        }
        if (
          item.speakers.filter((link) => link.role === "MODERATOR").length > 1
        ) {
          found.push({
            cardKey,
            message: `Session ${index + 1}: only one moderator. Use Panelist for the others.`,
          });
        }
        if (
          !item.date ||
          item.date < eventFirstDay ||
          item.date > eventLastDay
        ) {
          found.push({
            cardKey,
            message: `Session ${index + 1}: pick a date between ${eventFirstDay} and ${eventLastDay} (the event dates).`,
          });
        }

        if (item.endTime <= item.startTime) {
          found.push({
            cardKey,
            message: `Session ${index + 1}: end time must be after start. For a session past midnight, end it before 00:00.`,
          });
        }
      });

      workshops.forEach((item, index) => {
        const cardKey = `workshop-${item.key}`;

        if (!item.title.trim()) {
          found.push({
            cardKey,
            message: `Workshop ${index + 1}: topic / title is required.`,
          });
        }
        if (!item.speakerKey) {
          found.push({
            cardKey,
            message: `Workshop ${index + 1}: speaker is required.`,
          });
        }
        if (!item.link.trim()) {
          found.push({
            cardKey,
            message: `Workshop ${index + 1}: Google Form URL is required.`,
          });
        }
        if (
          !item.date ||
          item.date < eventFirstDay ||
          item.date > eventLastDay
        ) {
          found.push({
            cardKey,
            message: `Workshop ${index + 1}: pick a date between ${eventFirstDay} and ${eventLastDay} (the event dates).`,
          });
        }
        if (item.startTime && item.endTime && item.endTime <= item.startTime) {
          found.push({
            cardKey,
            message: `Workshop ${index + 1}: end time must be after start time.`,
          });
        }
      });

      setIssues(found);

      if (found.length > 0) {
        // Buka kartu pertama yang bermasalah dan gulir ke sana.
        setOpenCard(found[0].cardKey);
        requestAnimationFrame(() => {
          document
            .getElementById(found[0].cardKey)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        return;
      }
    } else {
      setIssues([]);
    }

    setSubmitting(true);

    try {
      const fallbackDate = form.startDate.slice(0, 10);
      const isPlatform = (form.publisherType ?? "PLATFORM") === "PLATFORM";
      const sendsSpeakers = isPlatform;
      const sendsAgenda = isPlatform;
      const sendsWorkshops = isPlatform;

      const payload = {
        ...form,
        workshopNote: isPlatform ? form.workshopNote : undefined,
        // Dikelola lewat payload di bawah, bukan diikutkan mentah.
        agenda: undefined,
        speakers: undefined,
        workshops: undefined,
        ...(sendsSpeakers
          ? {
              speakers: speakers.map((speaker) => ({
                id: /^\d+$/.test(speaker.key)
                  ? Number(speaker.key)
                  : speaker.key,
                name: speaker.name,
                title: speaker.title,
                titleLines: speaker.titleLines,
                photoUrl: speaker.photoUrl,
                photoPublicId: speaker.photoPublicId,
              })),
            }
          : {}),
        ...(sendsAgenda
          ? {
              agenda: agenda.map((item) => ({
                id: item.id,
                kind: item.kind,
                title: item.title,
                description: item.description,
                attendees: item.attendees,
                startTime: item.startTime
                  ? `${item.date || fallbackDate}T${item.startTime}`
                  : "",
                endTime: item.endTime
                  ? `${item.date || fallbackDate}T${item.endTime}`
                  : "",
                speakers: item.speakers,
              })),
            }
          : {}),
        ...(sendsWorkshops
          ? {
              workshops: workshops.map((item) => ({
                id: item.id,
                speakerKey: /^\d+$/.test(item.speakerKey)
                  ? Number(item.speakerKey)
                  : item.speakerKey,
                title: item.title,
                description: item.description,
                startTime: item.startTime
                  ? `${item.date || fallbackDate}T${item.startTime}`
                  : "",
                endTime: item.endTime
                  ? `${item.date || fallbackDate}T${item.endTime}`
                  : "",
                price: item.price,
                link: item.link,
              })),
            }
          : {}),
      };

      const res = await fetch(`/api/cadmin/events${id ? `?id=${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setIssues([
          {
            cardKey: "event-form-issues",
            message: err?.message || "Failed to save this event.",
          },
        ]);
        requestAnimationFrame(() => {
          document
            .getElementById("event-form-issues")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        return;
      }
      await Promise.all(
        [...discarded.current].map((publicId) =>
          fetch("/api/cloudinary/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId }),
          }).catch(() => undefined),
        ),
      );
      discarded.current.clear();
      const fresh = await fetch(`/api/cadmin/events?id=${id}`, {
        cache: "no-store",
      }).then((r) => (r.ok ? r.json() : null));

      if (fresh?.data) {
        applyServerEvent(fresh.data);
        router.refresh();

        setIssues([]);
        setSavedAt(Date.now());
        requestAnimationFrame(() => {
          document
            .getElementById("event-form-saved")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        return;
      }

      // Event baru tidak bisa diambil ulang lewat id; pindah ke daftar.
      router.refresh();
      router.push("/cadmin/events");
    } catch {
      setIssues([
        {
          cardKey: "event-form-issues",
          message:
            "Could not reach the server. Check your connection and try again.",
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-4xl space-y-8 rounded-lg bg-card p-6 pb-0 shadow"
    >
      <h1 className="text-2xl font-semibold">
        {id ? "Edit Event" : "Create Event"}
      </h1>

      {/* ================= BASIC INFO ================= */}
      <section className="space-y-4">
        <h2 className="font-medium text-lg">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Event Title</label>
          <input
            value={form.title}
            onChange={handleTitleChange}
            required
            placeholder="Ex: React Workshop 2026"
            className="w-full border px-3 py-2 rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Judul utama event yang akan tampil ke publik
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>

          <input
            name="slug"
            value={form.slug}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-200 cursor-not-allowed disabled:opacity-100 disabled:bg-gray-400"
          />
          <p className="text-xs text-gray-500 mt-1">
            Auto-generated and cannot be changed when editing.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Jakarta / Online"
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      </section>

      {/* ================= SCHEDULE ================= */}
      <section className="space-y-4">
        <h2 className="font-medium text-lg">Schedule</h2>

        <div id="event-dates" className="grid scroll-mt-24 grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="datetime-local"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="datetime-local"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              min={form.startDate || undefined}
              required
              className={
                form.endDate && form.startDate && form.endDate < form.startDate
                  ? "w-full rounded border border-destructive px-3 py-2"
                  : "w-full rounded border px-3 py-2"
              }
            />
            {form.endDate &&
              form.startDate &&
              form.endDate < form.startDate && (
                <p className="mt-1 text-xs text-destructive">
                  End date is before the start date.
                </p>
              )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Time Zone</label>
          <select
            name="timeZone"
            value={form.timeZone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
            <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
            <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
          </select>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className="space-y-4">
        <h2 className="font-medium text-lg">Pricing & Capacity</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="0 = Free"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quota</label>
            <input
              type="number"
              name="quota"
              value={form.quota ?? ""}
              onChange={handleChange}
              placeholder="Kosongkan jika unlimited"
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="space-y-3">
        <label
          htmlFor="event-description"
          className="block text-sm font-medium mb-1"
        >
          Description
        </label>
        <textarea
          id="event-description"
          name="description"
          rows={8}
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the event. Leave a blank line between paragraphs."
          className="w-full border px-3 py-2 rounded"
        />
        <p className="text-xs text-gray-500">
          Plain text. Blank lines separate paragraphs.
        </p>
      </section>

      {/* COVER IMAGE */}
      <ImageUploadField
        label="Cover Image"
        hint="4:3 image (1600x1200 max), WebP, normally under 100 KB."
        entityType="events"
        aspect={4 / 3}
        shape="wide"
        maxWidth={1600}
        maxHeight={1200}
        allowSkipCrop
        value={{
          url: form.coverImage || null,
          publicId: form.publicId || null,
        }}
        onChange={({ url, publicId }) =>
          setForm((prev) => ({
            ...prev,
            coverImage: url ?? "",
            publicId: publicId ?? "",
          }))
        }
      />

      {/* PROPOSAL PDF — hanya untuk event MindCare */}
      {(form.publisherType ?? "PLATFORM") === "PLATFORM" && (
        <section className="space-y-3 border-t pt-8">
          <div>
            <h2 className="text-lg font-semibold">Event Proposal</h2>
            <p className="mt-1 text-sm text-gray-500">
              Visitors can download this proposal from the public event page by
              filling in a short form; the PDF is then emailed to them. Leave it
              empty to send an auto-generated summary instead.
            </p>
          </div>

          <PdfUploadField
            label="Proposal PDF"
            hint="PDF, max 15 MB. Uploaded as-is — no compression."
            value={{
              url: form.proposalUrl || null,
              publicId: form.proposalPublicId || null,
            }}
            onChange={({ url, publicId }) =>
              setForm((prev) => ({
                ...prev,
                proposalUrl: url ?? "",
                proposalPublicId: publicId ?? "",
              }))
            }
            deferDelete
            onDiscard={(publicIds) => {
              for (const publicId of publicIds) {
                discarded.current.add(publicId);
              }
            }}
          />
        </section>
      )}

      {(form.publisherType ?? "PLATFORM") === "PLATFORM" && (
        <section className="space-y-6 border-t pt-8">
          <div>
            <h2 className="text-lg font-semibold">Speakers & Schedule</h2>
            <p className="mt-1 text-sm text-gray-500">
              Only shown on public pages for events published by MindCare.
            </p>
          </div>

          <AgendaSpeakersEditor
            speakers={speakers}
            agenda={agenda}
            minDate={form.startDate.slice(0, 10)}
            maxDate={form.endDate.slice(0, 10)}
            openKey={openCard}
            onOpenChange={setOpenCard}
            issues={Object.fromEntries(
              issues.map((issue) => [issue.cardKey, issue.message]),
            )}
            deferDelete
            onDiscard={(publicIds) => {
              for (const publicId of publicIds) {
                discarded.current.add(publicId);
              }
            }}
            onChange={({ speakers: nextSpeakers, agenda: nextAgenda }) => {
              // Kartu yang baru ditambahkan langsung dibuka,
              // supaya tidak perlu satu klik lagi untuk mengisi.
              const addedSpeaker = nextSpeakers.find(
                (speaker) => !speakers.some((prev) => prev.key === speaker.key),
              );
              const addedSession = nextAgenda.find(
                (item) => !agenda.some((prev) => prev.key === item.key),
              );
              if (addedSpeaker) setOpenCard(`speaker-${addedSpeaker.key}`);
              else if (addedSession) setOpenCard(`agenda-${addedSession.key}`);

              setSpeakers(nextSpeakers);
              setAgenda(nextAgenda);
            }}
          />

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold">Workshops</h2>
            <p className="mt-1 text-sm text-gray-500">
              Paid workshop sessions linked to Google Form.
            </p>

            <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
              <label className="block text-xs font-semibold text-foreground">
                Session Packages & Pricing Notes
              </label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Pricing or package discount details (e.g., 1 session Rp..., 2
                sessions Rp..., save Rp...). Displayed on the workshop
                registration card.
              </p>
              <textarea
                name="workshopNote"
                rows={3}
                value={form.workshopNote ?? ""}
                onChange={handleChange}
                placeholder={
                  "Contoh:\n1 sesi Rp385.000\n2 sesi Rp750.000 (hemat Rp20.000)\n3 sesi Rp1.110.000 (hemat Rp45.000)"
                }
                className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="mt-5">
              <WorkshopsEditor
                workshops={workshops}
                speakers={speakers}
                minDate={form.startDate.slice(0, 10)}
                maxDate={form.endDate.slice(0, 10)}
                openKey={openCard}
                onOpenChange={setOpenCard}
                issues={Object.fromEntries(
                  issues.map((issue) => [issue.cardKey, issue.message]),
                )}
                onChange={setWorkshops}
              />
            </div>
          </div>
        </section>
      )}

      {/* ================= PUBLISH ================= */}
      <section>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="isPublished"
            checked={form.isPublished}
            onChange={handleChange}
            className="h-5 w-5"
          />
          <span className="font-medium">Publish Event</span>
        </label>
      </section>

      {/* ================= SAVED NOTICE ================= */}
      {savedAt !== null && issues.length === 0 && (
        <section
          id="event-form-saved"
          className="scroll-mt-24 rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm text-foreground"
        >
          Saved. The form below now shows exactly what is in the database — you
          can keep editing.
        </section>
      )}
      {issues.length > 0 && (
        <section
          aria-labelledby="event-form-issues"
          className="rounded-xl border border-destructive/40 bg-destructive/5 p-4"
        >
          <h2
            id="event-form-issues"
            className="font-heading text-base font-semibold text-foreground"
          >
            {issues.length === 1
              ? "1 thing to fix before saving"
              : `${issues.length} things to fix before saving`}
          </h2>
          <ul className="mt-2 space-y-1">
            {issues.map((issue) => (
              <li key={`${issue.cardKey}-${issue.message}`}>
                <button
                  type="button"
                  onClick={() => {
                    // Kartu speaker/sesi dibuka; pesan
                    // tingkat form (mis. dari server) tidak.
                    setOpenCard(
                      issue.cardKey.startsWith("event-form")
                        ? null
                        : issue.cardKey,
                    );
                    requestAnimationFrame(() => {
                      document.getElementById(issue.cardKey)?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    });
                  }}
                  className="text-left text-sm text-destructive hover:underline"
                >
                  {issue.message}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="sticky bottom-0 z-10 -mx-6 -mb-6 flex flex-wrap items-center gap-3 border-t border-border bg-card/95 px-6 py-3 backdrop-blur">
        <button
          type="submit"
          disabled={submitting}
          className={buttonStyles({ variant: "primary", size: "md" })}
        >
          {submitting ? "Saving..." : id ? "Update event" : "Create event"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className={buttonStyles({ variant: "outline", size: "md" })}
        >
          Cancel
        </button>

        <p className="ml-auto text-xs text-muted-foreground">
          {speakers.length} {speakers.length === 1 ? "speaker" : "speakers"} ·{" "}
          {agenda.length} {agenda.length === 1 ? "session" : "sessions"}
          {workshops.length > 0 &&
            ` · ${workshops.length} workshop${workshops.length === 1 ? "" : "s"}`}
          {issues.length > 0 ? ` · ${issues.length} to fix` : ""}
        </p>
      </div>
    </form>
  );
}
