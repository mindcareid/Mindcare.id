"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { autoSlug } from "@/lib/utils/autoSlug";
import { toEventPlainText } from "@/lib/events/serializers";
import { fromUtcFormat } from "@/lib/date";
import ImageUploadField from "@/app/components/reusable/ImageUploadField";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import AgendaSpeakersEditor, {
    type AgendaDraft,
    type SpeakerDraft,
} from "./AgendaSpeakersEditor";
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
    isPublished: boolean;
    categoryId: number;
    publisherType?: string;
    agenda?: AgendaDefault[];
    speakers?: SpeakerDefault[];
};

/* ================= MAPPERS ================= */

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

/* ================= COMPONENT ================= */

/**
 * Membungkus `EventForm` dan memberi `key` yang berubah setiap kali data dari
 * server berubah.
 *
 * Ini menggantikan `useEffect` penyalin `defaultValues` ke state. Dengan `key`,
 * React membuat ulang komponen (state diisi dari data server yang baru) hanya
 * ketika data server memang berubah — bukan pada setiap render, dan tanpa
 * menimpa isian yang sedang diketik.
 */
export default function EventFormWrapper(props: EventFormProps) {
    // Penanda isi data server; berubah setelah simpan atau refetch.
    const revision = [
        props.id ?? "new",
        props.defaultValues?.startDate ?? "",
        props.defaultValues?.speakers?.length ?? 0,
        (props.defaultValues?.agenda ?? [])
            .map((item) => `${item.id}:${item.speakers?.length ?? 0}`)
            .join(","),
    ].join("|");

    return <EventForm key={revision} {...props} />;
}

function EventForm({
    id,
    defaultValues,
    categories,
}: EventFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    /* ================= FORM STATE ================= */
    // `form`, `speakers`, dan `agenda` diinisialisasi di bawah dari
    // `defaultValues` (lihat "INIT FROM SERVER").

    // Aset Cloudinary yang dibuang ditahan sampai data benar-benar tersimpan.
    const discarded = useRef<Set<string>>(new Set());

    // Hanya satu kartu speaker/sesi terbuka pada satu waktu, dan panel
    // validasi bisa membukanya + menggulir ke sana.
    // Berubah setiap simpan berhasil; dipakai menandai "saved" dan memicu
    // React memakai state hasil muat ulang.
    const [savedAt, setSavedAt] = useState<number | null>(null);

    const [openCard, setOpenCard] = useState<string | null>(null);
    const [issues, setIssues] = useState<
        { cardKey: string; message: string }[]
    >([]);

    /* ================= INIT FROM SERVER ================= */
    /*
     * State diisi sekali saat komponen dibuat, bukan lewat `useEffect`.
     *
     * Dulu ada `useEffect` yang menyalin `defaultValues` ke state. Pola itu
     * punya dua kegagalan yang saling bertentangan:
     *
     *  1. Dependensinya `[defaultValues, categories]`, dan keduanya objek baru
     *     pada setiap render server — jadi state yang sedang diisi tertimpa.
     *  2. Setelah dipersempit ke `[id]`, `router.refresh()` mengirim
     *     `defaultValues` baru tetapi effect tidak jalan lagi — form tetap
     *     menampilkan data sebelum simpan (gejala: tab lama "no speakers"
     *     padahal tab baru benar).
     *
     * Solusinya: remount. `EventFormWrapper` memberi `key` yang berubah setiap
     * kali data server berubah, sehingga state selalu berasal dari data yang
     * benar, tanpa menimpa isian yang sedang diketik.
     */
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
        isPublished: defaultValues?.isPublished ?? false,
        categoryId: Number(defaultValues?.categoryId ?? categories[0]?.id ?? 0),
        publisherType: defaultValues?.publisherType ?? "PLATFORM",
    }));

    // Speaker & agenda hanya untuk event MindCare (publisher PLATFORM).
    const [speakers, setSpeakers] = useState<SpeakerDraft[]>(() =>
        mapSpeakers(defaultValues),
    );

    const [agenda, setAgenda] = useState<AgendaDraft[]>(() =>
        mapAgenda(defaultValues, tz),
    );

    /**
     * Memasang ulang state dari data server (dipakai setelah simpan).
     *
     * Inilah yang menjamin layar selalu sama dengan database: kalau server
     * punya 7 sesi, layar menampilkan 7 — tanpa bergantung pada cache router.
     */
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
            endDate: server.endDate
                ? fromUtcFormat(server.endDate, serverTz)
                : "",
            timeZone: serverTz,
            price: server.price ?? 0,
            quota: server.quota ?? undefined,
            coverImage: server.coverImage ?? "",
            publicId: server.publicId ?? "",
            isPublished: server.isPublished ?? false,
            categoryId: Number(server.categoryId ?? form.categoryId),
            publisherType: server.publisherType ?? "PLATFORM",
        });

        setSpeakers(mapSpeakers(server));
        setAgenda(mapAgenda(server, serverTz));
        setOpenCard(null);
    };

    /* ================= HANDLERS ================= */

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
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

        // Tanggal acara diperiksa lebih dulu, untuk SEMUA event (bukan hanya
        // PLATFORM). Kalau End Date lebih awal dari Start Date, setiap sesi
        // pasti gagal dengan pesan yang membingungkan seperti
        // "pick a date between 2026-11-28 and 2026-11-27", dan date picker
        // menampilkan semua tanggal abu-abu karena rentangnya mustahil.
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

            // Semua masalah dikumpulkan sekaligus, bukan satu per satu lewat
            // `alert`: di form panjang, satu dialog menghilangkan konteks dan
            // admin harus menekan Simpan berulang kali untuk menemukan yang
            // berikutnya.
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

                // Sesi yang memang tidak menyebut orang (break) wajib punya
                // keterangan; sesi lain boleh diisi nama saja.
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

                // Moderator tunggal per sesi: dua moderator di satu sesi hampir
                // pasti salah input.
                if (
                    item.speakers.filter((link) => link.role === "MODERATOR")
                        .length > 1
                ) {
                    found.push({
                        cardKey,
                        message: `Session ${index + 1}: only one moderator. Use Panelist for the others.`,
                    });
                }

                // Tanggal sesi harus berada di rentang tanggal acara. Salah isi
                // tanggal event adalah penyebab paling sering, jadi kedua
                // tanggalnya ditampilkan.
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
            // Waktu sesi dikirim sebagai "YYYY-MM-DDTHH:MM" (jam & tanggal
            // lokal di zona event), persis seperti startDate/endDate.
            const fallbackDate = form.startDate.slice(0, 10);
            const isPlatform = (form.publisherType ?? "PLATFORM") === "PLATFORM";
            // Array kosong berarti "tidak ada", bukan "jangan sentuh": admin
            // harus bisa menghapus speaker/sesi terakhir. Keduanya selalu
            // dikirim berpasangan (API menolak yang setengah).
            const sendsSpeakers = isPlatform;
            const sendsAgenda = isPlatform;

            const payload = {
                ...form,
                // Dikelola lewat payload di bawah, bukan diikutkan mentah.
                agenda: undefined,
                speakers: undefined,
                ...(sendsSpeakers
                    ? {
                          speakers: speakers.map((speaker) => ({
                              // Baris lama mengirim id number; baris baru
                              // mengirim key string yang dipakai agenda.
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
            };

            const res = await fetch(`/api/cadmin/events${id ? `?id=${id}` : ""}`, {
                method: id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                // Penolakan server (mis. nama speaker bentrok) tampil di panel
                // yang sama, jadi admin tidak kehilangan konteks dan tetap
                // bisa mengklik pesannya.
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

            // Data tersimpan: aset yang dibuang saat mengedit baru sekarang
            // dihapus dari Cloudinary, supaya Cancel/error tidak ikut
            // menghapus foto yang masih dirujuk database.
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

            // Setelah simpan, form langsung diisi ulang dari RESPONS server
            // yang baru, bukan mengandalkan cache router. `router.refresh()`
            // tidak cukup: ia tidak selesai sebelum `push`, sehingga halaman
            // edit berikutnya bisa memakai versi lama (gejala: "5 sesi
            // padahal sudah 7"). `fetch` dengan `cache: "no-store"` tidak
            // melewati cache mana pun.
            const fresh = await fetch(`/api/cadmin/events?id=${id}`, {
                cache: "no-store",
            }).then((r) => (r.ok ? r.json() : null));

            if (fresh?.data) {
                // Data server dipasang ulang ke state, sehingga jumlah sesi
                // dan speaker di layar selalu sama dengan database.
                applyServerEvent(fresh.data);
                // Sinkronkan cache router agar navigasi berikutnya (Back,
                // buka edit lagi) juga memakai data ini.
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
                    message: "Could not reach the server. Check your connection and try again.",
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
                    <label className="block text-sm font-medium mb-1">
                        Event Title
                    </label>
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
                        className="w-full border px-3 py-2 rounded bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Dibuat otomatis dan tidak berubah saat edit
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Category
                    </label>
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
                    <label className="block text-sm font-medium mb-1">
                        Location
                    </label>
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

                <div
                    id="event-dates"
                    className="grid scroll-mt-24 grid-cols-2 gap-4"
                >
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Start Date
                        </label>
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
                        <label className="block text-sm font-medium mb-1">
                            End Date
                        </label>
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
                        {/* Rentang terbalik adalah penyebab tersering sesi
                            "tidak bisa dipilih", jadi ditandai di sini, bukan
                            baru muncul saat Simpan. */}
                        {form.endDate && form.startDate && form.endDate < form.startDate && (
                            <p className="mt-1 text-xs text-destructive">
                                End date is before the start date.
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Time Zone
                    </label>
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
                        <label className="block text-sm font-medium mb-1">
                            Price
                        </label>
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
                        <label className="block text-sm font-medium mb-1">
                            Quota
                        </label>
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


            {/* ================= SPEAKERS & SCHEDULE ================= */}
            {/* Hanya untuk event MindCare. Event listing (profesional/care
                centre) memakai form dashboard-nya sendiri dan tidak boleh
                melihat bagian ini. */}
            {(form.publisherType ?? "PLATFORM") === "PLATFORM" && (
                <section className="space-y-6 border-t pt-8">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Speakers & Schedule
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Only shown on public pages for events published by
                            MindCare.
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
                                (speaker) =>
                                    !speakers.some((prev) => prev.key === speaker.key),
                            );
                            const addedSession = nextAgenda.find(
                                (item) =>
                                    !agenda.some((prev) => prev.key === item.key),
                            );
                            if (addedSpeaker) setOpenCard(`speaker-${addedSpeaker.key}`);
                            else if (addedSession) setOpenCard(`agenda-${addedSession.key}`);

                            setSpeakers(nextSpeakers);
                            setAgenda(nextAgenda);
                        }}
                    />
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
                    Saved. The form below now shows exactly what is in the
                    database — you can keep editing.
                </section>
            )}

            {/* ================= VALIDATION SUMMARY ================= */}
            {/* Menggantikan `alert()`: semua masalah tampil sekaligus dan bisa
                diklik untuk membuka kartu yang bersangkutan. */}
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
                                            document
                                                .getElementById(issue.cardKey)
                                                ?.scrollIntoView({
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

            {/* ================= ACTIONS ================= */}
            {/* Lengket di bawah: setelah 10 speaker dan 8 sesi, tombol simpan
                versi lama berada ribuan piksel di bawah layar. */}
            <div className="sticky bottom-0 z-10 -mx-6 -mb-6 flex flex-wrap items-center gap-3 border-t border-border bg-card/95 px-6 py-3 backdrop-blur">
                <button
                    type="submit"
                    disabled={submitting}
                    className={buttonStyles({ variant: "primary", size: "md" })}
                >
                    {submitting
                        ? "Saving..."
                        : id
                            ? "Update event"
                            : "Create event"}
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
                    {issues.length > 0 ? ` · ${issues.length} to fix` : ""}
                </p>
            </div>
        </form>
    );
}
