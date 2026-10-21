"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import HeroForm, { type HeroFormValues } from "../../components/HeroForm";

type HeroApiData = {
  image: string | null;
  publicId: string | null;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export default function EditHeroPage() {
  const params = useParams();
  const id = params?.id as string;
  const [hero, setHero] = useState<HeroFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    fetch(`/api/hero?id=${id}`)
      .then((res) => res.json())
      .then((json) => {
        const data = json?.data as HeroApiData | undefined;
        if (!data) throw new Error("Slide not found");
        if (cancelled) return;

        setHero({
          image: data.image ?? "",
          publicId: data.publicId ?? "",
          title: data.title ?? "",
          subtitle: data.subtitle ?? "",
          description: data.description ?? "",
          buttonText: data.buttonText ?? "",
          buttonUrl: data.buttonUrl ?? "",
          order: data.sortOrder ?? 0,
          isActive: data.isActive ?? true,
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-sm text-muted-foreground md:p-8">
        Loading slide...
      </div>
    );
  }

  if (failed || !hero) {
    return (
      <div className="mx-auto max-w-2xl p-6 md:p-8">
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-card">
          This slide could not be loaded. It may have been deleted.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-8">
      <div className="mb-6 space-y-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Edit hero slide
        </h1>
        <p className="text-sm text-muted-foreground">
          Changes apply to the homepage slideshow right away.
        </p>
      </div>

      <HeroForm id={Number(id)} defaultValues={hero} />
    </div>
  );
}
