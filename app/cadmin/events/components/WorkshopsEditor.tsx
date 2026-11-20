"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import type { SpeakerDraft } from "./AgendaSpeakersEditor";

export type WorkshopDraft = {
  key: string;
  id?: number;
  speakerKey: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  price: string;
  link: string;
};

type WorkshopsEditorProps = {
  workshops: WorkshopDraft[];
  speakers: SpeakerDraft[];
  minDate?: string;
  maxDate?: string;
  openKey?: string | null;
  onOpenChange?: (key: string | null) => void;
  issues?: Record<string, string>;
  onChange: (workshops: WorkshopDraft[]) => void;
};

export default function WorkshopsEditor({
  workshops,
  speakers,
  minDate,
  maxDate,
  openKey,
  onOpenChange,
  issues = {},
  onChange,
}: WorkshopsEditorProps) {
  const [internalOpenKey, setInternalOpenKey] = useState<string | null>(null);
  const activeOpenKey = openKey !== undefined ? openKey : internalOpenKey;
  const setActiveOpenKey = onOpenChange ?? setInternalOpenKey;

  const handleAddWorkshop = () => {
    if (speakers.length === 0) return;
    const newKey = `workshop-new-${Date.now()}`;
    const defaultSpeakerKey = speakers[0]?.key ?? "";
    const defaultDate = minDate || new Date().toISOString().slice(0, 10);

    const next = [
      ...workshops,
      {
        key: newKey,
        speakerKey: defaultSpeakerKey,
        title: "",
        description: "",
        date: defaultDate,
        startTime: "13:00",
        endTime: "15:00",
        price: "Rp385.000",
        link: "",
      },
    ];

    onChange(next);
    setActiveOpenKey(`workshop-${newKey}`);
  };

  const handleUpdate = (index: number, patch: Partial<WorkshopDraft>) => {
    const next = workshops.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    onChange(next);
  };

  const handleDelete = (index: number) => {
    const target = workshops[index];
    if (target && activeOpenKey === `workshop-${target.key}`) {
      setActiveOpenKey(null);
    }
    onChange(workshops.filter((_, i) => i !== index));
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= workshops.length) return;
    const next = [...workshops];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;
    next.splice(toIndex, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {workshops.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No workshop sessions added yet.
          {speakers.length === 0 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Please add at least one speaker above before adding a workshop.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {workshops.map((item, index) => {
            const cardKey = `workshop-${item.key}`;
            const isOpen = activeOpenKey === cardKey;
            const issue = issues[cardKey];
            const assignedSpeaker = speakers.find(
              (s) => s.key === item.speakerKey,
            );

            return (
              <div
                key={item.key}
                id={cardKey}
                className={cn(
                  "rounded-lg border bg-card transition-colors",
                  issue ? "border-destructive/60 bg-destructive/5" : "border-border",
                )}
              >
                {/* Header Card */}
                <div className="flex items-center justify-between gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => setActiveOpenKey(isOpen ? null : cardKey)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.title.trim() || "(Untitled Workshop)"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {assignedSpeaker ? assignedSpeaker.name : "No speaker selected"}{" "}
                        · {item.startTime} - {item.endTime}
                        {item.price ? ` · ${item.price}` : ""}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, index - 1)}
                      className="rounded p-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-30"
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === workshops.length - 1}
                      onClick={() => handleMove(index, index + 1)}
                      className="rounded p-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-30"
                      title="Move Down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {issue && (
                  <p className="px-4 pb-2 text-xs font-medium text-destructive">
                    {issue}
                  </p>
                )}

                {/* Body Form Card saat Expanded */}
                {isOpen && (
                  <div className="space-y-4 border-t border-border p-4 pt-4">
                    {/* Speaker Selector */}
                    <div>
                      <label className="block text-xs font-medium text-foreground">
                        Speaker <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={item.speakerKey}
                        onChange={(e) =>
                          handleUpdate(index, { speakerKey: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {speakers.length === 0 ? (
                          <option value="">No speakers available</option>
                        ) : (
                          speakers.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.name} {s.title ? `(${s.title})` : ""}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Topic / Title */}
                    <div>
                      <label className="block text-xs font-medium text-foreground">
                        Topic / Title <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          handleUpdate(index, { title: e.target.value })
                        }
                        placeholder="e.g. Mengelola Burnout di Tempat Kerja"
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>

                    {/* Schedule: Date, Start Time, End Time */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-medium text-foreground">
                          Date
                        </label>
                        <input
                          type="date"
                          min={minDate}
                          max={maxDate}
                          value={item.date}
                          onChange={(e) =>
                            handleUpdate(index, { date: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={item.startTime}
                          onChange={(e) =>
                            handleUpdate(index, { startTime: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={item.endTime}
                          onChange={(e) =>
                            handleUpdate(index, { endTime: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    </div>

                    {/* Price and Google Form Link */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-foreground">
                          Price / Investment Info
                        </label>
                        <input
                          type="text"
                          value={item.price}
                          onChange={(e) =>
                            handleUpdate(index, { price: e.target.value })
                          }
                          placeholder="e.g. 1 sesi Rp385.000 / 2 sesi Rp750.000"
                          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground">
                          Google Form URL <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="url"
                          value={item.link}
                          onChange={(e) =>
                            handleUpdate(index, { link: e.target.value })
                          }
                          placeholder="https://forms.gle/..."
                          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-medium text-foreground">
                        Description (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) =>
                          handleUpdate(index, { description: e.target.value })
                        }
                        placeholder="Deskripsi singkat materi pembahasan..."
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        disabled={speakers.length === 0}
        onClick={handleAddWorkshop}
        className={buttonStyles({
          variant: "outline",
          size: "sm",
          className: "w-full border-dashed",
        })}
      >
        + Add Workshop Session
      </button>
    </div>
  );
}
