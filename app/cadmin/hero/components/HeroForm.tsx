"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import ImageUploadField, {
  type ImageValue,
} from "@/app/components/reusable/ImageUploadField";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const HERO_ASPECT = 16 / 7;

async function destroyAssets(publicIds: string[]) {
  const unique = Array.from(new Set(publicIds.filter(Boolean)));
  await Promise.all(
    unique.map((publicId) =>
      fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      }).catch(() => undefined),
    ),
  );
}

/** Dipakai saat unmount, ketika navigasi bisa membatalkan request biasa. */
function destroyAssetsOnLeave(publicIds: string[]) {
  const unique = Array.from(new Set(publicIds.filter(Boolean)));
  for (const publicId of unique) {
    fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId }),
      keepalive: true,
    }).catch(() => undefined);
  }
}

export type HeroFormValues = {
  image: string;
  publicId: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  order: number;
  isActive: boolean;
};

type HeroFormProps = {
  id?: number;
  defaultValues?: Partial<HeroFormValues>;
};

export default function HeroForm({ id, defaultValues }: HeroFormProps) {
  const router = useRouter();

  const [image, setImage] = useState<ImageValue>({
    url: defaultValues?.image || null,
    publicId: defaultValues?.publicId || null,
  });
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [subtitle, setSubtitle] = useState(defaultValues?.subtitle ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? "",
  );
  const [buttonText, setButtonText] = useState(defaultValues?.buttonText ?? "");
  const [buttonUrl, setButtonUrl] = useState(defaultValues?.buttonUrl ?? "");
  const [order, setOrder] = useState(defaultValues?.order ?? 0);
  const [isActive, setIsActive] = useState(defaultValues?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [imageError, setImageError] = useState<string>();

  // publicId yang tersimpan di DB saat form dibuka. Ini satu-satunya aset yang
  // tidak boleh dihapus selama belum ada penyimpanan yang berhasil.
  const originalPublicIdRef = useRef(defaultValues?.publicId || null);
  // Aset yang sudah digantikan/dihapus selama sesi ini tetapi belum tentu
  // tersimpan, jadi penghapusannya ditunda.
  const discardedRef = useRef<string[]>([]);
  // publicId yang sedang tampil, dibaca saat unmount.
  const currentPublicIdRef = useRef(image.publicId);
  // Menandai bahwa ada penyimpanan berhasil, supaya pembersihan saat unmount
  // tidak ikut menghapus aset yang baru saja tersimpan.
  const savedRef = useRef(false);

  useEffect(() => {
    currentPublicIdRef.current = image.publicId;
  }, [image.publicId]);

  const handleDiscard = (publicIds: string[]) => {
    discardedRef.current.push(...publicIds);
  };

  // Pembersihan terakhir: pengguna bisa meninggalkan halaman lewat menu, bukan
  // tombol Cancel. Aset yang diunggah sesi ini tidak boleh tertinggal.
  useEffect(() => {
    // Aset asli tidak berubah selama form hidup, jadi aman dibaca di sini.
    const original = originalPublicIdRef.current;

    return () => {
      if (savedRef.current) return;

      const orphans = discardedRef.current.filter((pid) => pid !== original);
      const current = currentPublicIdRef.current;
      if (current && current !== original) orphans.push(current);
      discardedRef.current = [];

      if (orphans.length > 0) destroyAssetsOnLeave(orphans);
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!image.url) {
      setImageError("Upload an image before saving.");
      return;
    }

    const hasText = buttonText.trim().length > 0;
    const hasLink = buttonUrl.trim().length > 0;
    if (hasText !== hasLink) {
      toast.error(
        hasText
          ? "Add the button link, or clear the button text."
          : "Add the button text, or clear the button link.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/hero${id ? `?id=${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(id ? { id } : {}),
          title: title.trim() || null,
          subtitle: subtitle.trim() || null,
          description: description.trim() || null,
          buttonText: buttonText.trim() || null,
          buttonUrl: buttonUrl.trim() || null,
          image: image.url,
          publicId: image.publicId,
          order,
          isActive,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || "Could not save the slide");
      }

      // Data sudah tersimpan: baru sekarang aset lama boleh dihapus. Kalau
      // gagal, efeknya hanya aset tersisa di Cloudinary, bukan gambar rusak.
      savedRef.current = true;
      const stale = discardedRef.current;
      discardedRef.current = [];
      await destroyAssets(stale);

      toast.success(id ? "Slide updated" : "Slide added");
      router.push("/cadmin/hero");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the slide",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      // Batal: DB tidak berubah, jadi aset asli harus tetap ada. Yang dibuang
      // hanya gambar yang diunggah selama sesi ini.
      const original = originalPublicIdRef.current;
      const orphans = discardedRef.current.filter((pid) => pid !== original);
      if (image.publicId && image.publicId !== original) {
        orphans.push(image.publicId);
      }
      discardedRef.current = [];
      // Pembersihan sudah ditangani di sini.
      savedRef.current = true;

      await destroyAssets(orphans);
    } finally {
      router.push("/cadmin/hero");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-card">
        <ImageUploadField
          label="Slide image"
          hint={`Shown full width on the homepage. Wide images work best, for example 1920x840. It is resized and saved as WebP.`}
          entityType="hero"
          aspect={HERO_ASPECT}
          maxWidth={1920}
          maxHeight={860}
          value={image}
          onChange={(next) => {
            setImage(next);
            if (next.url) setImageError(undefined);
          }}
          deferDelete
          onDiscard={handleDiscard}
          error={imageError}
          required
        />

        <div>
          <label
            htmlFor="hero-title"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Title
          </label>
          <input
            id="hero-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={255}
            placeholder="Mental health support, all in one place"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Shown over this slide. Leave empty to use the homepage default
            title.
          </p>
        </div>

        <div>
          <label
            htmlFor="hero-description"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Description
          </label>
          <textarea
            id="hero-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Psychologists, psychiatrists, and counselling centres across Indonesia."
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Shown under the title. Leave empty to use the homepage default text.
          </p>
        </div>

        <div>
          <label
            htmlFor="hero-alt"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Alt text
          </label>
          <input
            id="hero-alt"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            maxLength={255}
            placeholder="Counselling room at a MindCare centre"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Describes the image when the slide has no title or description. Once
            the slide shows its own text, the image is treated as decorative.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="hero-button-text"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Button text
            </label>
            <input
              id="hero-button-text"
              value={buttonText}
              onChange={(event) => setButtonText(event.target.value)}
              maxLength={255}
              placeholder="Find a professional"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="hero-button-url"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Button link
            </label>
            <input
              id="hero-button-url"
              value={buttonUrl}
              onChange={(event) => setButtonUrl(event.target.value)}
              maxLength={500}
              placeholder="/professionals"
              className={inputClass}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Without a slide button, the homepage falls back to its default
          buttons. Fill either both fields or neither. The link must point to a
          page that exists, either an internal path like /events or a full
          https:// URL.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="hero-order"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Order
            </label>
            <input
              id="hero-order"
              type="number"
              value={order}
              onChange={(event) => setOrder(Number(event.target.value))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Lowest number shows first.
            </p>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-foreground">
              Visibility
            </span>
            <label className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="size-5 rounded border-border accent-primary"
              />
              <span className="text-sm text-foreground">
                Active on the homepage
              </span>
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Only active slides appear in the slideshow.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className={buttonStyles({ size: "md" })}
        >
          {submitting ? "Saving..." : id ? "Save slide" : "Add slide"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelling}
          className={buttonStyles({ variant: "outline", size: "md" })}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
