import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";
import {
  EventAgendaKind,
  EventPublisherType,
  EventStatus,
  Prisma,
} from "@prisma/client";
import { getAdminUser } from "@/lib/adminGuard";
import { PLATFORM_SLUG } from "@/lib/events/constants";
import { toUtc } from "@/lib/date";
import { formatInTimeZone } from "date-fns-tz";
import {
  DEFAULT_AGENDA_SPEAKER_ROLE,
  agendaKindHidesSpeakers,
  agendaKindLabel,
  isAgendaSpeakerRole,
  type AgendaSpeakerRole,
} from "@/lib/events/agenda";
import {
  isCloudinaryAssetUrl,
  isPublicIdInEntityFolder,
} from "@/lib/cloudinary/asset";


function resolveTimeZone(body: Record<string, unknown>): string {
  return typeof body.timeZone === "string" && body.timeZone
    ? body.timeZone
    : "Asia/Jakarta";
}

async function getPlatformId(): Promise<number | null> {
  const platform = await prisma.platform.findUnique({
    where: { slug: PLATFORM_SLUG },
    select: { id: true },
  });

  return platform?.id ?? null;
}

function resolveStatus(body: Record<string, unknown>): EventStatus {
  const raw = body.status;

  if (typeof raw === "string" && raw in EventStatus) {
    return EventStatus[raw as keyof typeof EventStatus];
  }

  return body.isPublished === true ? EventStatus.PUBLISHED : EventStatus.DRAFT;
}

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function resolveKind(value: unknown): EventAgendaKind {
  if (typeof value === "string" && value in EventAgendaKind) {
    return EventAgendaKind[value as keyof typeof EventAgendaKind];
  }
  return EventAgendaKind.TALK;
}

/** Kesalahan validasi yang harus jadi 422, bukan 500. */
class AgendaError extends Error {}

type SpeakerInput = {
  id?: number;
  /**
   * Identitas baris yang dipakai agenda (`speakers[].key`) untuk merujuk
   * speaker ini. Selalu string: id dari database diubah ke `"123"`, baris baru
   * memakai key sementara dari form. Dulu hanya string yang diterima, sehingga
   * simpan kedua kali gagal karena form mengirim id sebagai number.
   */
  clientKey: string | null;
  name: string;
  title: string | null;
  titleLines: string | null;
  photoUrl: string | null;
  photoPublicId: string | null;
  sortOrder: number;
};

type AgendaInput = {
  id?: number;
  clientKey: string | null;
  kind: EventAgendaKind;
  title: string;
  description: string | null;
  attendees: string | null;
  startTime: Date;
  endTime: Date;
  sortOrder: number;
  /**
   * Speaker yang tampil di sesi ini, berurutan sesuai urutan nama. `role`
   * adalah peran orang itu **di sesi ini** (moderator, panelis, dst).
   */
  speakers: { key: string; role: AgendaSpeakerRole }[];
};

/**
 * Menormalkan `speakers[]` dari body. `null` berarti field tidak dikirim
 * (jangan disentuh); array berarti daftar baru yang menggantikan yang lama.
 */
function parseSpeakers(
  raw: unknown,
): { ok: true; speakers: SpeakerInput[] } | { ok: false; error: string } {
  if (raw === undefined) return { ok: true, speakers: [] };
  if (!Array.isArray(raw)) {
    return { ok: false, error: "speakers must be an array" };
  }

  const speakers: SpeakerInput[] = [];
  const seen = new Set<string>();

  for (const [index, item] of raw.entries()) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: `Speaker #${index + 1} is not an object` };
    }

    const row = item as Record<string, unknown>;
    const name = text(row.name);
    if (!name) {
      return { ok: false, error: `Speaker #${index + 1} needs a name` };
    }
    if (seen.has(name.toLowerCase())) {
      return { ok: false, error: `Speaker "${name}" is listed twice` };
    }
    seen.add(name.toLowerCase());

    const photoUrl = text(row.photoUrl);
    const photoPublicId = text(row.photoPublicId);
    if (Boolean(photoUrl) !== Boolean(photoPublicId)) {
      return {
        ok: false,
        error: `Speaker "${name}": photo and its public id must be provided together`,
      };
    }
    // Foto hanya boleh dari bucket Cloudinary proyek ini. URL luar akan gagal
    // dirender next/image (domain tidak ada di next.config) dan membuat
    // halaman publik error, bukan sekadar gambar kosong.
    if (photoUrl && !isCloudinaryAssetUrl(photoUrl)) {
      return {
        ok: false,
        error: `Speaker "${name}": photo must be uploaded, not pasted as a link`,
      };
    }
    if (photoPublicId && !isPublicIdInEntityFolder(photoPublicId, "events")) {
      return {
        ok: false,
        error: `Speaker "${name}": photo belongs to another folder`,
      };
    }

    // `id` boleh number (baris tersimpan) atau string (baris baru). Keduanya
    // jadi kunci string, karena itulah yang dipakai `agenda[].speakers[].key`.
    const numericId = Number.isInteger(row.id)
      ? Number(row.id)
      : typeof row.id === "string" && /^\d+$/.test(row.id.trim())
        ? Number(row.id.trim())
        : undefined;
    const clientKey =
      typeof row.id === "string" && row.id.trim()
        ? row.id.trim()
        : numericId !== undefined
          ? String(numericId)
          : null;

    speakers.push({
      id: numericId,
      clientKey,
      name,
      title: text(row.title),
      titleLines: text(row.titleLines),
      photoUrl,
      photoPublicId,
      sortOrder: index,
    });
  }

  return { ok: true, speakers };
}

/**
 * Menormalkan `agenda[]`. `startTime`/`endTime` diterima sebagai jam lokal
 * "HH:MM" dan digabung dengan tanggal event, atau ISO lengkap.
 */
function parseAgenda(
  raw: unknown,
  args: {
    eventDate: Date;
    timeZone: string;
    /** `YYYY-MM-DD` hari pertama & terakhir acara (zona event). */
    firstDay: string;
    lastDay: string;
    /** clientKey seluruh speaker yang dikirim body. */
    speakerKeys: Set<string>;
  },
): { ok: true; agenda: AgendaInput[] } | { ok: false; error: string } {
  if (raw === undefined) return { ok: true, agenda: [] };
  if (!Array.isArray(raw)) {
    return { ok: false, error: "agenda must be an array" };
  }

  const agenda: AgendaInput[] = [];
  // Tanggal sesi dibaca di zona event, bukan UTC: event 02:00 WIB berarti
  // 19:00Z hari sebelumnya, dan jam lokal "08:00" harus jatuh di hari event.
  const datePart = formatInTimeZone(args.eventDate, args.timeZone, "yyyy-MM-dd");

  const toDate = (value: unknown): Date | null => {
    if (typeof value !== "string" || !value.trim()) return null;
    const raw = value.trim();
    const iso = /^\d{2}:\d{2}$/.test(raw)
      ? `${datePart}T${raw}:00`
      : raw;
    const parsed = toUtc(iso, args.timeZone);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  for (const [index, item] of raw.entries()) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: `Agenda #${index + 1} is not an object` };
    }

    const row = item as Record<string, unknown>;
    const title = text(row.title);
    if (!title) {
      return { ok: false, error: `Agenda #${index + 1} needs a title` };
    }

    const startTime = toDate(row.startTime);
    const endTime = toDate(row.endTime);
    if (!startTime || !endTime) {
      return {
        ok: false,
        error: `Agenda "${title}" needs a start and end time`,
      };
    }
    if (endTime <= startTime) {
      return {
        ok: false,
        error: `Agenda "${title}": end time must be after start time`,
      };
    }

    // Field yang dipakai adalah `speakers` (daftar { key, role }). Bentuk lama
    // `speakerKeys` (array string) tetap dibaca sebagai cadangan, supaya klien
    // yang belum diperbarui tidak rusak. Dulu yang dibaca hanya `speakerKeys`,
    // sehingga centangan di form baru dikirim dengan benar lalu dibuang di
    // sini — gejalanya "speaker tersimpan tapi sesinya kosong".
    const rawSpeakers = Array.isArray(row.speakers)
      ? row.speakers
      : Array.isArray(row.speakerKeys)
        ? row.speakerKeys
        : [];
    const sessionSpeakers: { key: string; role: AgendaSpeakerRole }[] = [];
    const seenKeys = new Set<string>();

    for (const entry of rawSpeakers) {
      const key =
        typeof entry === "string"
          ? entry.trim()
          : entry && typeof entry === "object"
            ? String((entry as Record<string, unknown>).key ?? "").trim()
            : "";
      const rawRole =
        entry && typeof entry === "object"
          ? (entry as Record<string, unknown>).role
          : undefined;

      if (!key) {
        return { ok: false, error: `Agenda "${title}" has an empty speaker` };
      }
      if (!args.speakerKeys.has(key)) {
        return {
          ok: false,
          error: `Agenda "${title}" references a speaker that does not exist`,
        };
      }
      if (seenKeys.has(key)) {
        return {
          ok: false,
          error: `Agenda "${title}" lists the same speaker twice`,
        };
      }
      if (rawRole !== undefined && !isAgendaSpeakerRole(rawRole)) {
        return {
          ok: false,
          error: `Agenda "${title}": unknown speaker role "${String(rawRole)}"`,
        };
      }
      seenKeys.add(key);
      sessionSpeakers.push({
        key,
        role: isAgendaSpeakerRole(rawRole)
          ? rawRole
          : DEFAULT_AGENDA_SPEAKER_ROLE,
      });
    }

    const kind = resolveKind(row.kind);
    const hidesSpeakers = agendaKindHidesSpeakers(kind);

    // Satu moderator per sesi. Dicek di server juga supaya request langsung
    // tidak bisa menyimpan panel dengan dua moderator.
    if (sessionSpeakers.filter((link) => link.role === "MODERATOR").length > 1) {
      return {
        ok: false,
        error: `Agenda "${title}": only one moderator per session`,
      };
    }
    if (hidesSpeakers && sessionSpeakers.length > 0) {
      return {
        ok: false,
        error: `Agenda "${title}": a ${agendaKindLabel(kind)} session does not take speakers. Put the line in the notes instead.`,
      };
    }

    if (hidesSpeakers && !text(row.attendees) && !text(row.description)) {
      return {
        ok: false,
        error: `Agenda "${title}": add a line describing who or what fills this session.`,
      };
    }

    // Sesi boleh di hari mana pun selama masih di rentang acara. Tanpa ini,
    // tanggal di luar rentang tersimpan diam-diam dan halaman publik
    // menampilkan sesi di luar tanggal acara.
    const sessionDate = formatInTimeZone(startTime, args.timeZone, "yyyy-MM-dd");
    if (sessionDate < args.firstDay || sessionDate > args.lastDay) {
      return {
        ok: false,
        error: `Agenda "${title}": pick a date between ${args.firstDay} and ${args.lastDay} (the event dates)`,
      };
    }

    agenda.push({
      id: Number.isInteger(row.id) ? Number(row.id) : undefined,
      clientKey:
        typeof row.id === "string" && row.id.trim() ? row.id.trim() : null,
      kind,
      title,
      description: text(row.description),
      attendees: text(row.attendees),
      startTime,
      endTime,
      sortOrder: index,
      speakers: sessionSpeakers,
    });
  }

  return { ok: true, agenda };
}

/**
 * Menyimpan speaker + agenda untuk satu event di dalam transaksi yang sudah
 * berjalan. Urutannya: speaker dulu (karena pivot merujuk ke id-nya), lalu
 * agenda, lalu pivot.
 */
async function saveAgendaAndSpeakers(
  tx: Prisma.TransactionClient,
  eventId: number,
  params: {
    speakers: SpeakerInput[] | null;
    agenda: AgendaInput[] | null;
  },
): Promise<void> {
  const { speakers, agenda } = params;

  const existingSpeakers = await tx.eventSpeaker.findMany({
    where: { eventId },
    select: { id: true, name: true },
  });

  // Nama unik per event ditegakkan database (`EventSpeaker_eventId_name_key`,
  // kolom utf8mb4_unicode_ci sehingga tidak peduli huruf besar/kecil). Tanpa
  // cek di sini, rename ke nama yang sudah dipakai — atau menukar dua nama —
  // gagal di tengah transaksi dan muncul sebagai 500 generik.
  if (speakers) {
    const ownedBy = new Map(
      existingSpeakers.map((row) => [row.name.toLowerCase(), row.id]),
    );

    for (const speaker of speakers) {
      const lower = speaker.name.toLowerCase();
      const ownerId = ownedBy.get(lower);
      // Aman kalau nama itu milik baris ini sendiri, atau milik baris yang
      // sedang diganti namanya di penyimpanan yang sama (kasus tukar nama).
      const ownerIsChanging = speakers.some(
        (other) => other.id === ownerId && other.name.toLowerCase() !== lower,
      );
      if (ownerId !== undefined && ownerId !== speaker.id && !ownerIsChanging) {
        throw new AgendaError(
          `Speaker "${speaker.name}" already exists on this event`,
        );
      }
    }
  }

  // ---- speaker ----
  // Kunci pivot adalah `clientKey`, bukan indeks: baris yang baru dibuat
  // mendapat id dari database, sedangkan baris lama memakai id-nya sendiri.
  const speakerIdByKey = new Map<string, number>();
  const existingSpeakerIds = new Set(existingSpeakers.map((s) => s.id));
  const keptSpeakerIds = new Set<number>();

  if (speakers) {
    for (const speaker of speakers) {
      const data = {
        name: speaker.name,
        title: speaker.title,
        titleLines: speaker.titleLines,
        photoUrl: speaker.photoUrl,
        photoPublicId: speaker.photoPublicId,
        sortOrder: speaker.sortOrder,
      };

      if (speaker.id && existingSpeakerIds.has(speaker.id)) {
        await tx.eventSpeaker.update({ where: { id: speaker.id }, data });
        keptSpeakerIds.add(speaker.id);
        if (speaker.clientKey) speakerIdByKey.set(speaker.clientKey, speaker.id);
        continue;
      }

      const created = await tx.eventSpeaker.create({
        data: { eventId, ...data },
      });
      if (speaker.clientKey) {
        speakerIdByKey.set(speaker.clientKey, created.id);
      }
    }
  }

  // ---- agenda ----
  const existingAgenda = await tx.eventAgendaItem.findMany({
    where: { eventId },
    select: { id: true },
  });
  const existingAgendaIds = new Set(existingAgenda.map((a) => a.id));
  const keptAgendaIds = new Set<number>();

  if (agenda) {
    const agendaIdByPosition: number[] = [];

    for (const item of agenda) {
      const data = {
        kind: item.kind,
        title: item.title,
        description: item.description,
        // Keterangan teks hanya bermakna saat sesi tidak punya pembicara.
        attendees: item.speakers.length ? null : item.attendees,
        startTime: item.startTime,
        endTime: item.endTime,
        sortOrder: item.sortOrder,
      };

      if (item.id && existingAgendaIds.has(item.id)) {
        await tx.eventAgendaItem.update({ where: { id: item.id }, data });
        keptAgendaIds.add(item.id);
        agendaIdByPosition.push(item.id);
        continue;
      }

      const created = await tx.eventAgendaItem.create({
        data: { eventId, ...data },
      });
      keptAgendaIds.add(created.id);
      agendaIdByPosition.push(created.id);
    }

    // Pivot sesi yang dikirim dibangun ulang dari `speakerKeys`.
    if (agendaIdByPosition.length) {
      await tx.eventAgendaSpeaker.deleteMany({
        where: { agendaItemId: { in: agendaIdByPosition } },
      });
    }

    for (const [position, item] of agenda.entries()) {
      const agendaItemId = agendaIdByPosition[position];
      if (!agendaItemId || item.speakers.length === 0) continue;
      // Lapis kedua: walau validasi sudah menolak, jangan pernah menulis
      // pivot untuk sesi yang memang tidak menyebut orang (mis. break).
      if (agendaKindHidesSpeakers(item.kind)) continue;

      const links = item.speakers
        .map(({ key, role }, order) => ({
          speakerId: speakerIdByKey.get(key),
          role,
          sortOrder: order,
        }))
        .filter(
          (link): link is { speakerId: number; role: AgendaSpeakerRole; sortOrder: number } =>
            typeof link.speakerId === "number",
        );
      if (links.length === 0) continue;

      await tx.eventAgendaSpeaker.createMany({
        data: links.map((link) => ({ agendaItemId, ...link })),
      });
    }
  }

  // ---- yang tidak dikirim lagi dihapus ----
  // Pivot dibersihkan eksplisit lebih dulu, tidak hanya mengandalkan
  // ON DELETE CASCADE di migrasi: relationMode proyek ini "prisma", dan FK
  // manual tidak ditegakkan kalau tabelnya bukan InnoDB.
  if (speakers) {
    const staleSpeakers = [...existingSpeakerIds].filter(
      (id) => !keptSpeakerIds.has(id),
    );
    if (staleSpeakers.length) {
      await tx.eventAgendaSpeaker.deleteMany({
        where: { speakerId: { in: staleSpeakers } },
      });
      await tx.eventSpeaker.deleteMany({
        where: { id: { in: staleSpeakers } },
      });
    }
  }

  if (agenda) {
    const staleAgenda = [...existingAgendaIds].filter(
      (id) => !keptAgendaIds.has(id),
    );
    if (staleAgenda.length) {
      await tx.eventAgendaSpeaker.deleteMany({
        where: { agendaItemId: { in: staleAgenda } },
      });
      await tx.eventAgendaItem.deleteMany({
        where: { id: { in: staleAgenda } },
      });
    }
  }
}

/* =========================
   GET - list / detail
======================== */
export async function GET(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // DETAIL
    if (id) {
      const event = await prisma.event.findFirst({
        where: {
          id: Number(id),
          deletedAt: null,
        },
        include: {
          category: true,
          speakers: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
          agenda: {
            orderBy: [{ sortOrder: "asc" }, { startTime: "asc" }],
            include: {
              speakers: {
                orderBy: { sortOrder: "asc" },
                select: { speakerId: true, role: true },
              },
            },
          },
        },
      });

      if (!event) {
        return NextResponse.json(
          { success: false, message: "Event not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: event,
      });
    }

    // LIST
    const events = await prisma.event.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

/* =========================
   POST - create
======================== */
export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await req.json();

    const platformId = await getPlatformId();
    if (!platformId) {
      return NextResponse.json(
        { success: false, message: "Platform identity is not configured" },
        { status: 500 },
      );
    }

    const status = resolveStatus(body);
    const timeZone = resolveTimeZone(body);
    const startDate = toUtc(body.startDate, timeZone);

    const speakersInput = Array.isArray(body.speakers) ? body.speakers : [];
    const parsedSpeakers = parseSpeakers(speakersInput);
    if (!parsedSpeakers.ok) {
      return NextResponse.json(
        { success: false, message: parsedSpeakers.error },
        { status: 422 },
      );
    }

    const agendaInput = Array.isArray(body.agenda) ? body.agenda : [];
    const parsedAgenda = parseAgenda(agendaInput, {
      eventDate: startDate,
      timeZone,
      firstDay: formatInTimeZone(startDate, timeZone, "yyyy-MM-dd"),
      lastDay: formatInTimeZone(
        toUtc(body.endDate, timeZone),
        timeZone,
        "yyyy-MM-dd",
      ),
      speakerKeys: new Set(
        parsedSpeakers.speakers
          .map((speaker) => speaker.clientKey)
          .filter((key): key is string => Boolean(key)),
      ),
    });
    if (!parsedAgenda.ok) {
      return NextResponse.json(
        { success: false, message: parsedAgenda.error },
        { status: 422 },
      );
    }

    const event = await prisma.$transaction(async (tx) => {
      const created = await tx.event.create({
        data: {
          title: body.title,
          slug: slugify(body.title, { lower: true }),
          description: body.description,
          location: body.location,
          startDate,
          endDate: toUtc(body.endDate, timeZone),
          timeZone,
          price: Number(body.price),
          quota: body.quota ? Number(body.quota) : null,
          categoryId: Number(body.categoryId),
          coverImage: body.coverImage,
          publicId: body.publicId,
          status,
          isPublished: status === EventStatus.PUBLISHED,
          publisherType: EventPublisherType.PLATFORM,
          platformId,
          createdById: admin.id,
        },
      });

      // Event baru: array kosong berarti "tidak ada", bukan "jangan sentuh".
      // `speakers` wajib dikirim (boleh kosong) supaya pivot sesi bisa dibaca.
      await saveAgendaAndSpeakers(tx, created.id, {
        speakers: parsedSpeakers.speakers,
        agenda: parsedAgenda.agenda,
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    if (error instanceof AgendaError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 422 },
      );
    }
    console.error("[CADMIN_CREATE_EVENT]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create event" },
      { status: 500 },
    );
  }
}

/* =========================
   PUT - update
======================== */
export async function PUT(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const slug = body.slug;
    // slug unique check (exclude self)
    if (slug) {
      const slugUsed = await prisma.event.findFirst({
        where: {
          slug,
          NOT: { id: Number(id) },
        },
      });

      if (slugUsed) {
        return NextResponse.json(
          { message: "Slug already in use" },
          { status: 400 },
        );
      }
    }

    // Draft = disembunyikan dari publik. status & isPublished selalu
    // disimpan bersama supaya kedua jalur pembacaan publik konsisten.
    const status = resolveStatus(body);
    const timeZone = resolveTimeZone(body);
    const startDate = toUtc(body.startDate, timeZone);

    const current = await prisma.event.findFirst({
      where: { id: Number(id), deletedAt: null },
      select: { publisherType: true },
    });
    if (!current) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );
    }

    // Speaker & agenda hanya untuk event MindCare. Untuk event lain, field
    // itu dibiarkan apa adanya.
    const writesAgenda = current.publisherType === EventPublisherType.PLATFORM;
    const sendsSpeakers = writesAgenda && body.speakers !== undefined;
    const sendsAgenda = writesAgenda && body.agenda !== undefined;

    // Speaker dan agenda selalu dikirim berpasangan: mengganti daftar speaker
    // tanpa agenda akan menghapus tautan sesi yang tidak bisa dibangun ulang.
    if (sendsSpeakers !== sendsAgenda) {
      return NextResponse.json(
        {
          success: false,
          message:
            "speakers and agenda must be sent together, so session links stay valid",
        },
        { status: 422 },
      );
    }

    let parsedSpeakers: SpeakerInput[] = [];
    let parsedAgenda: AgendaInput[] = [];

    if (sendsSpeakers) {
      const result = parseSpeakers(body.speakers);
      if (!result.ok) {
        return NextResponse.json(
          { success: false, message: result.error },
          { status: 422 },
        );
      }
      parsedSpeakers = result.speakers;
    }

    if (sendsAgenda) {
      const result = parseAgenda(body.agenda, {
        eventDate: startDate,
        timeZone,
        firstDay: formatInTimeZone(startDate, timeZone, "yyyy-MM-dd"),
        lastDay: formatInTimeZone(
          toUtc(body.endDate, timeZone),
          timeZone,
          "yyyy-MM-dd",
        ),
        // `speakerKeys` hanya boleh merujuk speaker yang dikirim di body yang
        // sama, supaya tautan sesi tidak mungkin mengarah ke orang yang tidak
        // muncul di daftar.
        speakerKeys: new Set(
          parsedSpeakers
            .map((speaker) => speaker.clientKey)
            .filter((key): key is string => Boolean(key)),
        ),
      });
      if (!result.ok) {
        return NextResponse.json(
          { success: false, message: result.error },
          { status: 422 },
        );
      }
      parsedAgenda = result.agenda;
    }

    const event = await prisma.$transaction(async (tx) => {
      const updated = await tx.event.update({
        where: { id: Number(id) },
        data: {
          title: body.title,
          slug,
          description: body.description,
          location: body.location,
          startDate,
          endDate: toUtc(body.endDate, timeZone),
          timeZone,
          price: Number(body.price),
          quota: body.quota ? Number(body.quota) : null,
          categoryId: Number(body.categoryId),
          coverImage: body.coverImage,
          publicId: body.publicId,
          status,
          isPublished: status === EventStatus.PUBLISHED,
        },
      });

      if (sendsSpeakers || sendsAgenda) {
        await saveAgendaAndSpeakers(tx, updated.id, {
          speakers: sendsSpeakers ? parsedSpeakers : null,
          agenda: sendsAgenda ? parsedAgenda : null,
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    if (error instanceof AgendaError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 422 },
      );
    }
    console.error("[CADMIN_UPDATE_EVENT]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update event" },
      { status: 500 },
    );
  }
}

/* =========================
   DELETE - soft delete
======================== */
export async function DELETE(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Event id is required" },
        { status: 400 },
      );
    }

    // Soft delete: hanya baris yang masih hidup yang disentuh, jadi id yang
    // salah atau yang sudah terhapus dilaporkan 404, bukan sukses palsu.
    const { count } = await prisma.event.updateMany({
      where: { id: Number(id), deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (count === 0) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete event" },
      { status: 500 },
    );
  }
}
