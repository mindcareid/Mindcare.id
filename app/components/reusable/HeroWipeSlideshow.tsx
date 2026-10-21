"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import Container from "./Container";
import { buttonStyles } from "./buttonStyles";

export type HeroSlide = {
  src: string;
  alt: string;
  /** Optional per-slide heading. Falls back to `defaultTitle`. */
  title?: string;
  /** Optional per-slide paragraph. Falls back to `defaultDescription`. */
  description?: string;
  ctaText?: string;
  ctaHref?: string;
};

type HeroWipeSlideshowProps = {
  slides: HeroSlide[];
  autoplay?: boolean;
  interval?: number;
  duration?: number;
  direction?: "leftToRight" | "rightToLeft";
  showControls?: boolean;
  className?: string;
  /** Static kicker above the heading, same across slides. */
  eyebrow?: string;
  /** Heading used when the current slide defines no title. */
  defaultTitle?: string;
  /** Paragraph used when the current slide defines no description. */
  defaultDescription?: string;
  /** CTA row used when the current slide defines no button. */
  defaultActions?: ReactNode;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HeroWipeSlideshow({
  slides,
  autoplay = true,
  interval = 5,
  duration = 0.9,
  direction = "leftToRight",
  showControls = true,
  className,
  eyebrow,
  defaultTitle,
  defaultDescription,
  defaultActions,
}: HeroWipeSlideshowProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const reduceMotion = useReducedMotion();

  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [toIndex, setToIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const current = count > 0 ? index % count : 0;

  const transitioning = toIndex !== null;
  const target = toIndex ?? (count > 0 ? (current + 1) % count : 0);
  const visible = slides[current];
  const incoming = slides[target];
  const canAnimate = count > 1;

  // Wipe dijalankan hanya dengan `transform` supaya bisa dikomposit di GPU.
  // Pola: jendela klip digeser, dan gambar di dalamnya digeser balik dengan
  // besar yang sama sehingga gambar terlihat diam sementara tepinya membuka.
  const windowStart = direction === "rightToLeft" ? "100%" : "-100%";
  const imageStart = direction === "rightToLeft" ? "-100%" : "100%";
  const revealDuration = reduceMotion ? 0.2 : Math.max(0.15, duration);

  const heading = visible.title?.trim() || defaultTitle;
  const description = visible.description?.trim() || defaultDescription;
  // Kalau slide menampilkan teksnya sendiri, gambar jadi dekoratif: teksnya
  // sudah dibacakan, jadi `alt` dikosongkan alih-alih menduplikasi.
  const isDecorative = Boolean(
    visible.title?.trim() || visible.description?.trim(),
  );
  const visibleAlt = isDecorative ? "" : visible.alt;

  const goTo = useCallback(
    (raw: number) => {
      if (count <= 1) return;
      setToIndex((active) => {
        if (active !== null) return active;
        const next = ((raw % count) + count) % count;
        if (next === current) return active;
        return next;
      });
    },
    [count, current],
  );

  const goNext = useCallback(() => goTo(current + 1), [goTo, current]);
  const goPrev = useCallback(() => goTo(current - 1), [goTo, current]);

  const settle = useCallback((value: number) => {
    setIndex(value);
    setToIndex(null);
  }, []);

  useEffect(() => {
    if (!autoplay || paused || !inView || count <= 1) return;

    const id = window.setInterval(
      () => goNext(),
      Math.max(1500, interval * 1000),
    );

    return () => window.clearInterval(id);
  }, [autoplay, paused, inView, count, interval, goNext]);

  if (count === 0) return null;

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          goNext();
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goPrev();
        }
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className={cn(
        "relative isolate w-full overflow-hidden bg-brand-navy-950",
        "h-105 sm:h-120 lg:h-140",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src={visible.src}
            alt={visibleAlt}
            fill
            sizes="100vw"
            priority={current === 0}
            className="object-cover"
          />
        </div>

        {/*
          Lapisan reveal selalu terpasang (tanpa mount/unmount saat transisi),
          jadi gambarnya sudah ter-decode dan tidak ada lonjakan paint di awal
          animasi. Saat idle ia berada di luar jendela klip, jadi tidak terlihat.
          `loading="eager"` dipakai karena IntersectionObserver menganggap
          elemen yang sudah digeser keluar layar sebagai belum terlihat, jadi
          mode lazy akan memuat gambar justru saat wipe dimulai.
        */}
        {canAnimate && incoming && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
            initial={false}
            animate={
              reduceMotion
                ? { x: "0%", opacity: transitioning ? 1 : 0 }
                : { x: transitioning ? "0%" : windowStart, opacity: 1 }
            }
            transition={
              transitioning
                ? { duration: revealDuration, ease: EASE }
                : { duration: 0 }
            }
            style={{ willChange: "transform, opacity" }}
          >
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={
                reduceMotion
                  ? { x: "0%" }
                  : { x: transitioning ? "0%" : imageStart }
              }
              transition={
                transitioning
                  ? { duration: revealDuration, ease: EASE }
                  : { duration: 0 }
              }
              style={{ willChange: "transform" }}
              onAnimationComplete={() => {
                if (transitioning) settle(target);
              }}
            >
              <Image
                src={incoming.src}
                alt=""
                fill
                sizes="100vw"
                loading="eager"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand-navy-950/85 via-brand-navy-950/45 to-brand-navy-950/5"
        aria-hidden="true"
      />

      <Container className="relative flex h-full flex-col justify-end pb-12">
        <div className="max-w-2xl text-white">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/80">
              {eyebrow}
            </p>
          )}

          {heading && (
            <h1
              className={cn(
                "font-heading text-[34px] font-semibold leading-[1.05] tracking-[-0.01em] text-white md:text-[44px] lg:text-[56px]",
                eyebrow && "mt-3",
              )}
            >
              {heading}
            </h1>
          )}

          {description && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
              {description}
            </p>
          )}

          {(eyebrow || heading || description) && (
            <div className="mt-7">
              {visible.ctaText && visible.ctaHref ? (
                <Link
                  href={visible.ctaHref}
                  className={buttonStyles({ size: "lg" })}
                >
                  {visible.ctaText}
                </Link>
              ) : (
                defaultActions
              )}
            </div>
          )}
        </div>

        {showControls && canAnimate && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              {slides.map((slide, i) => {
                const active = i === current;

                return (
                  <button
                    key={slide.src + i}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show slide ${i + 1}: ${slide.alt}`}
                    aria-current={active ? "true" : undefined}
                    className="group flex h-11 items-center px-1 focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        "relative block h-1.5 overflow-hidden rounded-full transition-all duration-300",
                        "group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-brand-navy-950",
                        active
                          ? "w-10 bg-white/35"
                          : "w-4 bg-white/50 group-hover:bg-white/80",
                      )}
                    >
                      {active && autoplay && !paused && !reduceMotion && (
                        <motion.span
                          key={`progress-${current}`}
                          className="absolute inset-y-0 left-0 rounded-full bg-white"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{
                            duration: Math.max(1.5, interval),
                            ease: "linear",
                          }}
                        />
                      )}
                      {active && (!autoplay || paused || reduceMotion) && (
                        <span className="absolute inset-0 rounded-full bg-white" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous slide"
                className="flex size-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next slide"
                className="flex size-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          Slide {current + 1} of {count}: {heading ?? visible.alt}
        </p>
      </Container>
    </section>
  );
}
