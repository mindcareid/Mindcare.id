"use client";

import { cn } from "@/lib/utils";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import ImageUploadField from "@/app/components/reusable/ImageUploadField";
import {
  AGENDA_KINDS,
  AGENDA_SPEAKER_ROLES,
  DEFAULT_AGENDA_SPEAKER_ROLE,
  agendaKindHidesSpeakers,
  type AgendaSpeakerRole,
} from "@/lib/events/agenda";
import type { EventAgendaKind } from "@prisma/client";

/*
 * Susunan acara + speaker event MindCare (design.md bagian 33).
 *
 * Satu state, dua daftar: `speakers` (kartu orang) dan `agenda` (sesi). Sesi
 * merujuk speaker lewat `speakerKeys`, bukan teks, supaya nama di halaman
 * publik bisa jadi tautan yang tidak mungkin meleset.
 */

export type SpeakerDraft = {
  /** id dari database, atau string sementara untuk baris baru. */
  key: string;
  name: string;
  title: string;
  titleLines: string;
  photoUrl: string;
  photoPublicId: string;
};

export type AgendaDraft = {
  key: string;
  id?: number;
  kind: EventAgendaKind;
  /** `YYYY-MM-DD`. Tiap sesi membawa tanggalnya sendiri (acara bisa >1 hari). */
  date: string;
  title: string;
  description: string;
  attendees: string;
  /** `HH:MM` waktu lokal zona event. */
  startTime: string;
  /** `HH:MM` waktu lokal zona event. */
  endTime: string;
  /** Peran melekat pada sesi ini, bukan pada orangnya. */
  speakers: { key: string; role: AgendaSpeakerRole }[];
};

export { agendaKindHidesSpeakers };

type AgendaSpeakersEditorProps = {
  speakers: SpeakerDraft[];
  agenda: AgendaDraft[];
  onChange: (next: { speakers: SpeakerDraft[]; agenda: AgendaDraft[] }) => void;
  /** Tanggal terawal & terakhir yang boleh dipakai sesi. */
  minDate: string;
  maxDate: string;
  /**
   * Saat true, foto yang dibuang tidak langsung dihapus dari Cloudinary;
   * publicId-nya dikembalikan lewat `onDiscard` dan dihapus setelah data
   * benar-benar tersimpan. Ini mencegah aset hilang saat admin menekan Cancel.
   */
  deferDelete?: boolean;
  onDiscard?: (publicIds: string[]) => void;
  /**
   * Hanya satu kartu terbuka pada satu waktu. Dikendalikan induk supaya panel
   * validasi bisa membuka kartu yang bermasalah dan menggulir ke sana.
   */
  openKey: string | null;
  onOpenChange: (key: string | null) => void;
  /** Penanda kartu bermasalah, mis. `{ "speaker-1": "Name is required" }`. */
  issues?: Record<string, string>;
};

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const hintClass = "mt-1 text-xs text-muted-foreground";

export default function AgendaSpeakersEditor({
  speakers,
  agenda,
  onChange,
  minDate,
  maxDate,
  deferDelete = false,
  onDiscard,
  openKey,
  onOpenChange,
  issues = {},
}: AgendaSpeakersEditorProps) {
  const discard = (publicIds: string[]) => {
    if (publicIds.length === 0) return;
    if (deferDelete) {
      onDiscard?.(publicIds);
      return;
    }
    for (const publicId of publicIds) {
      void fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      }).catch(() => undefined);
    }
  };

  const updateSpeaker = (index: number, patch: Partial<SpeakerDraft>) => {
    onChange({
      speakers: speakers.map((speaker, i) =>
        i === index ? { ...speaker, ...patch } : speaker,
      ),
      agenda,
    });
  };

  /** Memindahkan satu baris ke atas/bawah dan mengembalikan daftar baru. */
  const moveItem = <T,>(list: T[], index: number, direction: -1 | 1): T[] => {
    const target = index + direction;
    if (target < 0 || target >= list.length) return list;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  };

  /** Tombol panah untuk mengatur urutan tampil di halaman publik. */
  const MoveButtons = ({
    index,
    total,
    onMove,
  }: {
    index: number;
    total: number;
    onMove: (direction: -1 | 1) => void;
  }) => (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={index === 0}
        aria-label="Move up"
        className="rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-30"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={index === total - 1}
        aria-label="Move down"
        className="rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-30"
      >
        ↓
      </button>
    </span>
  );

  const removeSpeaker = (index: number) => {
    const removed = speakers[index];
    onChange({
      speakers: speakers.filter((_, i) => i !== index),
      // Sesi yang merujuk speaker ini kehilangan tautannya, bukan sesinya.
      agenda: agenda.map((item) => ({
        ...item,
        speakers: item.speakers.filter((link) => link.key !== removed.key),
      })),
    });
    if (removed.photoPublicId) discard([removed.photoPublicId]);
  };

  const addSpeaker = () => {
    onChange({
      speakers: [
        ...speakers,
        {
          key: `new-speaker-${Date.now()}-${speakers.length}`,
          name: "",
          title: "",
          titleLines: "",
          photoUrl: "",
          photoPublicId: "",
        },
      ],
      agenda,
    });
  };

  const updateAgenda = (index: number, patch: Partial<AgendaDraft>) => {
    onChange({
      speakers,
      agenda: agenda.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    });
  };

  const addAgenda = () => {
    // Sesi baru mulai di tanggal acara dan pada jam berakhir sesi sebelumnya,
    // supaya susunan acara bisa langsung ditulis berurutan.
    const last = agenda[agenda.length - 1];
    onChange({
      speakers,
      agenda: [
        ...agenda,
        {
          key: `new-agenda-${Date.now()}-${agenda.length}`,
          kind: agenda.length === 0 ? "OPENING" : "TALK",
          date: last?.date || minDate,
          title: "",
          description: "",
          attendees: "",
          startTime: last?.endTime || "",
          endTime: "",
          speakers: [],
        },
      ],
    });
  };

  const removeAgenda = (index: number) => {
    onChange({
      speakers,
      agenda: agenda.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-10">
      {/* ================= SPEAKER ================= */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Speakers
            </h2>
            <p className={hintClass}>
              People appearing at this event. They are stored with the event and
              are not linked to a professional profile.
            </p>
          </div>
          <button
            type="button"
            onClick={addSpeaker}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            + Add speaker
          </button>
        </div>

        {speakers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No speakers yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {speakers.map((speaker, index) => {
              const cardKey = `speaker-${speaker.key}`;
              const isOpen = openKey === cardKey;
              const issue = issues[cardKey];
              const photoMark = speaker.photoUrl ? "photo ✓" : "no photo";

              return (
                <li
                  key={speaker.key}
                  id={cardKey}
                  className={cn(
                    "scroll-mt-24 overflow-hidden rounded-xl border",
                    issue ? "border-destructive" : "border-border",
                  )}
                >
                  {/* ---- ringkasan: satu baris saat tertutup ---- */}
                  <div
                    className={cn(
                      "flex flex-wrap items-center gap-2 px-3 py-2",
                      isOpen ? "bg-muted/40" : "hover:bg-muted/30",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenChange(isOpen ? null : cardKey)}
                      aria-expanded={isOpen}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {speaker.name || "Unnamed speaker"}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {speaker.title || "No role yet"} · {photoMark}
                          {issue ? ` · ${issue}` : ""}
                        </span>
                      </span>
                    </button>

                    <MoveButtons
                      index={index}
                      total={speakers.length}
                      onMove={(direction) =>
                        onChange({
                          speakers: moveItem(speakers, index, direction),
                          agenda,
                        })
                      }
                    />

                    <button
                      type="button"
                      onClick={() => onOpenChange(isOpen ? null : cardKey)}
                      className={buttonStyles({
                        variant: "ghost",
                        size: "sm",
                        className: "shrink-0",
                      })}
                    >
                      {isOpen ? "Done" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSpeaker(index)}
                      className="shrink-0 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>

                  {/* ---- detail: hanya kartu yang terbuka ---- */}
                  {isOpen && (
                    <div className="grid gap-4 border-t border-border p-4 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>Name</label>
                        <input
                          value={speaker.name}
                          onChange={(e) =>
                            updateSpeaker(index, { name: e.target.value })
                          }
                          placeholder="Isdar Andre Marwan, S.Psi, Psikolog"
                          className={inputClass}
                        />
                        <p className={hintClass}>
                          Name only, including degrees. This is the text linked
                          from the agenda.
                        </p>
                      </div>

                      <div>
                        <label className={labelClass}>Role / affiliation</label>
                        <input
                          value={speaker.title}
                          onChange={(e) =>
                            updateSpeaker(index, { title: e.target.value })
                          }
                          placeholder="Ketua ILUNI Psikologi UI"
                          className={inputClass}
                        />
                        <p className={hintClass}>
                          Position or organisation, shown under the name.
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <ImageUploadField
                          label="Photo (optional)"
                          hint="Portrait, 4:5. Leave empty to show initials."
                          entityType="events"
                          aspect={4 / 5}
                          shape="square"
                          maxWidth={600}
                          maxHeight={750}
                          value={{
                            url: speaker.photoUrl || null,
                            publicId: speaker.photoPublicId || null,
                          }}
                          deferDelete={deferDelete}
                          onDiscard={(publicIds) => discard(publicIds)}
                          onChange={({ url, publicId }) =>
                            updateSpeaker(index, {
                              photoUrl: url ?? "",
                              photoPublicId: publicId ?? "",
                            })
                          }
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelClass}>
                          Extra role lines (optional, one per line)
                        </label>
                        <textarea
                          rows={2}
                          value={speaker.titleLines}
                          onChange={(e) =>
                            updateSpeaker(index, { titleLines: e.target.value })
                          }
                          placeholder="Psychologist, Faculty of Psychology UI"
                          className={inputClass}
                        />
                        <p className={hintClass}>
                          Use this when the role needs more than one line.
                        </p>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ================= AGENDA ================= */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Schedule
            </h2>
            <p className={hintClass}>
              Date, time, session type, title, and who speaks. Each session can
              have more than one speaker.
            </p>
          </div>
          <button
            type="button"
            onClick={addAgenda}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            + Add session
          </button>
        </div>

        {agenda.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No sessions yet.
          </div>
        ) : (
          <div className="space-y-2">
            {agenda.map((item, index) => {
              const withoutSpeakers = agendaKindHidesSpeakers(item.kind);
              // `item.key` sudah berawalan `agenda-` (dibentuk EventForm),
              // jadi jangan ditambah lagi: dulu menghasilkan
              // "agenda-agenda-1" yang tidak cocok dengan penanda error.
              const cardKey =
                item.key.startsWith("agenda-") ? item.key : `agenda-${item.key}`;
              const isOpen = openKey === cardKey;
              const issue = issues[cardKey];
              const kindLabel =
                AGENDA_KINDS.find((entry) => entry.value === item.kind)?.label ??
                item.kind;
              const timeRange =
                item.startTime || item.endTime
                  ? `${item.startTime || "…"}–${item.endTime || "…"}`
                  : "no time";
              const people =
                item.speakers.length > 0
                  ? `${item.speakers.length} ${item.speakers.length === 1 ? "person" : "people"}`
                  : "no speakers";

              return (
                <div
                  key={item.key}
                  id={cardKey}
                  className={cn(
                    "scroll-mt-24 overflow-hidden rounded-xl border",
                    issue ? "border-destructive" : "border-border",
                  )}
                >
                  {/* ---- ringkasan: satu baris saat tertutup ---- */}
                  <div
                    className={cn(
                      "flex flex-wrap items-center gap-2 px-3 py-2",
                      isOpen ? "bg-muted/40" : "hover:bg-muted/30",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenChange(isOpen ? null : cardKey)}
                      aria-expanded={isOpen}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="w-24 shrink-0 text-xs tabular-nums text-secondary">
                        {item.date.slice(5)} {timeRange}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {item.title || "Untitled session"}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {kindLabel} · {people}
                          {issue ? ` · ${issue}` : ""}
                        </span>
                      </span>
                    </button>

                    <MoveButtons
                      index={index}
                      total={agenda.length}
                      onMove={(direction) =>
                        onChange({
                          speakers,
                          agenda: moveItem(agenda, index, direction),
                        })
                      }
                    />

                    <button
                      type="button"
                      onClick={() => onOpenChange(isOpen ? null : cardKey)}
                      className={buttonStyles({
                        variant: "ghost",
                        size: "sm",
                        className: "shrink-0",
                      })}
                    >
                      {isOpen ? "Done" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAgenda(index)}
                      className="shrink-0 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>

                  {isOpen && (
                  <div className="grid gap-4 border-t border-border p-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Session type</label>
                      <select
                        value={item.kind}
                        onChange={(e) =>
                          updateAgenda(index, {
                            kind: e.target.value as EventAgendaKind,
                          })
                        }
                        className={inputClass}
                      >
                        {AGENDA_KINDS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>Date</label>
                        <input
                          type="date"
                          value={item.date}
                          min={minDate}
                          max={maxDate}
                          onChange={(e) =>
                            updateAgenda(index, { date: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Start</label>
                        <input
                          type="time"
                          value={item.startTime}
                          onChange={(e) =>
                            updateAgenda(index, { startTime: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>End</label>
                        <input
                          type="time"
                          value={item.endTime}
                          onChange={(e) =>
                            updateAgenda(index, { endTime: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClass}>Title</label>
                      <input
                        value={item.title}
                        onChange={(e) =>
                          updateAgenda(index, { title: e.target.value })
                        }
                        placeholder="Menjaga Kesehatan Mental di Tempat Kerja"
                        className={inputClass}
                      />
                    </div>

                    {withoutSpeakers ? (
                      <div className="md:col-span-2">
                        <label className={labelClass}>Line</label>
                        <input
                          value={item.attendees}
                          onChange={(e) =>
                            updateAgenda(index, { attendees: e.target.value })
                          }
                          placeholder="Registrasi dan pembukaan"
                          className={inputClass}
                        />
                        <p className={hintClass}>
                          Shown under the title for sessions without speakers.
                        </p>
                      </div>
                    ) : (
                      <div className="md:col-span-2">
                        <p className={labelClass}>
                          People in this session
                        </p>
                        {speakers.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Add a speaker first, then pick them here.
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {speakers.map((speaker) => {
                              // Peran melekat pada sesi ini, jadi di sesi lain
                              // orang yang sama boleh punya peran berbeda.
                              const link = item.speakers.find(
                                (entry) => entry.key === speaker.key,
                              );
                              const checked = Boolean(link);
                              return (
                                <li
                                  key={speaker.key}
                                  className={cn(
                                    "flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                                    checked
                                      ? "border-primary bg-primary/5"
                                      : "border-border",
                                  )}
                                >
                                  <label className="inline-flex flex-1 cursor-pointer items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        updateAgenda(index, {
                                          speakers: checked
                                            ? item.speakers.filter(
                                                (entry) =>
                                                  entry.key !== speaker.key,
                                              )
                                            : [
                                                ...item.speakers,
                                                {
                                                  key: speaker.key,
                                                  role: DEFAULT_AGENDA_SPEAKER_ROLE,
                                                },
                                              ],
                                        })
                                      }
                                    />
                                    <span
                                      className={cn(
                                        checked
                                          ? "text-foreground"
                                          : "text-muted-foreground",
                                      )}
                                    >
                                      {speaker.name || "Unnamed speaker"}
                                    </span>
                                  </label>

                                  {checked && (
                                    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                      Role
                                      <select
                                        value={link?.role ?? DEFAULT_AGENDA_SPEAKER_ROLE}
                                        onChange={(e) =>
                                          updateAgenda(index, {
                                            speakers: item.speakers.map((entry) =>
                                              entry.key === speaker.key
                                                ? {
                                                    ...entry,
                                                    role: e.target
                                                      .value as AgendaSpeakerRole,
                                                  }
                                                : entry,
                                            ),
                                          })
                                        }
                                        className="rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground"
                                      >
                                        {AGENDA_SPEAKER_ROLES.map((role) => (
                                          <option key={role.value} value={role.value}>
                                            {role.label}
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className={labelClass}>Notes (optional)</label>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) =>
                          updateAgenda(index, { description: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
