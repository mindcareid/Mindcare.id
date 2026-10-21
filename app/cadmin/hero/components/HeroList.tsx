"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Images, Pencil, Plus, Trash2 } from "lucide-react";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import EmptyState from "@/app/components/reusable/EmptyState";
import { cn } from "@/lib/utils";

type HeroSlider = {
  id: number;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  publicId: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export default function HeroList() {
  const [slides, setSlides] = useState<HeroSlider[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/hero")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setSlides(json?.data ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load slides");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(slide: HeroSlider) {
    if (
      !confirm(
        "Delete this slide? Its image is removed from Cloudinary as well.",
      )
    ) {
      return;
    }

    setProcessingId(slide.id);
    try {
      if (slide.publicId) {
        // Best-effort: kalau aset sudah tidak ada, baris DB tetap dihapus.
        await fetch("/api/cloudinary/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: slide.publicId }),
        }).catch(() => undefined);
      }

      const res = await fetch("/api/hero", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slide.id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || "Could not delete the slide");
      }

      setSlides((prev) => prev.filter((item) => item.id !== slide.id));
      toast.success("Slide deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete the slide",
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-card">
        Loading slides...
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <EmptyState
        icon={Images}
        title="No hero slides yet"
        description="Add an image to start the homepage slideshow. Until at least one slide is active, the homepage keeps its default hero."
        action={
          <Link href="/cadmin/hero/create" className={buttonStyles({ size: "md" })}>
            <Plus className="h-4 w-4" />
            Add slide
          </Link>
        }
      />
    );
  }

  return (
    <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      {slides.map((slide, index) => (
        <li
          key={slide.id}
          className={cn(
            "flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between",
            index > 0 && "border-t border-border",
          )}
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
              {slide.image ? (
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : null}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {slide.title || "Uses homepage default title"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {slide.buttonText
                  ? `Button: ${slide.buttonText}`
                  : "No button"}
                {" · Order "}
                {slide.sortOrder}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium",
                slide.isActive
                  ? "bg-brand-mint-100 text-accent"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {slide.isActive ? "Active" : "Inactive"}
            </span>

            <Link
              href={`/cadmin/hero/edit/${slide.id}`}
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>

            <button
              type="button"
              disabled={processingId === slide.id}
              onClick={() => handleDelete(slide)}
              className={buttonStyles({ variant: "danger", size: "sm" })}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
