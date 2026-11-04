"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

import { cn } from "@/lib/utils";

/*
 * ============================================================
 * COUNTRY COMBOBOX
 * ============================================================
 *
 * Kenapa bukan <select> biasa: daftarnya 250 negara. Dropdown native dengan
 * 250 baris menyebalkan di ponsel dan lebih lambat dari sekadar mengetik dua
 * huruf. Karena itu combobox ini tetap TERTUTUP (nilai yang dikirim selalu
 * baris dari daftar, bukan teks bebas) tapi bisa dicari.
 *
 * Aksesibilitas: input memakai role="combobox" dengan aria-controls dan
 * aria-activedescendant, daftar memakai role="listbox". Panah atas/bawah,
 * Enter, dan Escape ditangani manual.
 */

export type CountryOption = {
  code: string;
  name: string;
  /**
   * Kode panggil (bisa lebih dari satu, dipisah koma). Opsional supaya
   * kombobox bisa dipakai tanpa data telepon. Hanya dipakai form untuk
   * mengenali negara dari nomor; kombobox sendiri tidak menampilkannya.
   */
  callingCode?: string | null;
};

export default function CountryCombobox({
  id,
  options,
  value,
  onChange,
  placeholder = "Select a country",
  disabled = false,
  invalid = false,
  ariaLabel,
}: {
  id: string;
  options: CountryOption[];
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(
    () => options.find((option) => option.code === value) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.name.toLowerCase().includes(q) || option.code.toLowerCase() === q,
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    function onDocumentClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${active}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function commit(option: CountryOption) {
    onChange(option.code);
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      setActive(0);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[active];
      if (option) commit(option);
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={
          open && filtered[active] ? `${id}-option-${filtered[active].code}` : undefined
        }
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border bg-card px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2",
          invalid
            ? "border-destructive focus:ring-destructive"
            : "border-border focus:ring-ring",
          disabled && "opacity-60",
        )}
        value={open ? query : (selected?.name ?? "")}
        placeholder={placeholder}
        onFocus={() => {
          if (disabled) return;
          setOpen(true);
          setActive(0);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          if (!open) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />

      {open ? (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No country matches “{query.trim()}”.
            </li>
          ) : (
            filtered.map((option, index) => (
              <li
                key={option.code}
                id={`${id}-option-${option.code}`}
                data-index={index}
                role="option"
                aria-selected={option.code === value}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 px-4 py-2 text-sm",
                  index === active
                    ? "bg-brand-lavender-100 text-foreground"
                    : "text-foreground",
                )}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(event) => {
                  // mousedown: jangan menunggu blur input, karena daftar
                  // ditutup oleh listener mousedown di dokumen.
                  event.preventDefault();
                  commit(option);
                }}
              >
                <span>
                  {option.name}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {option.code}
                  </span>
                </span>
                {option.code === value ? (
                  <Check className="size-4 shrink-0 text-accent" aria-hidden="true" />
                ) : null}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
