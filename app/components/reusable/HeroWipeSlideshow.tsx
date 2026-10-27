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
  // Teks dan indikator mengikuti slide tujuan sejak wipe dimulai supaya klik
  // langsung terasa, sementara gambar dasar tetap slide lama sampai wipe selesai.
  const indicatorIndex = toIndex ?? current;
  const baseSlide = slides[current];
  const shownSlide = slides[indicatorIndex];
  const incoming = slides[target];
  const canAnimate = count > 1;

  // Wipe dijalankan hanya dengan `transform` supaya bisa dikomposit di GPU.
  // Pola: jendela klip digeser, dan gambar di dalamnya digeser balik dengan
  // besar yang sama sehingga gambar terlihat diam sementara tepinya membuka.
  const windowStart = direction === "rightToLeft" ? "100%" : "-100%";
  const imageStart = direction === "rightToLeft" ? "-100%" : "100%";
  const revealDuration = reduceMotion ? 0.2 : Math.max(0.15, duration);

  const heading = shownSlide.title?.trim() || defaultTitle;
  const description = shownSlide.description?.trim() || defaultDescription;
  // Kalau slide menampilkan teksnya sendiri, gambar jadi dekoratif: teksnya
  // sudah dibacakan, jadi `alt` dikosongkan alih-alih menduplikasi.
  const isDecorative = Boolean(
    shownSlide.title?.trim() || shownSlide.description?.trim(),
  );
  const visibleAlt = isDecorative ? "" : shownSlide.alt;

  const goTo = useCallback(
    (raw: number) => {
      if (count <= 1) return;
      const next = ((raw % count) + count) % count;
      // Klik saat wipe masih berjalan tidak dibuang: target diganti, lalu wipe
      // yang sedang berjalan melanjutkan reveal ke slide yang baru dipilih.
      setToIndex((active) => {
        const shown = active ?? current;
        return next === shown ? active : next;
      });
    },
    [count, current],
  );

  const goNext = useCallback(
    () => goTo((toIndex ?? current) + 1),
    [goTo, current, toIndex],
  );
  const goPrev = useCallback(
    () => goTo((toIndex ?? current) - 1),
    [goTo, current, toIndex],
  );

  const settle = useCallback((value: number) => {
    setIndex(value);
    setToIndex(null);
  }, []);

  // Autoplay tidak boleh melompati slide saat transisi sebelumnya belum
  // selesai, jadi ia hanya maju ketika tidak ada wipe yang berjalan.
  const autoNext = useCallback(() => {
    if (toIndex !== null) return;
    goTo(current + 1);
  }, [goTo, current, toIndex]);

  const autoNextRef = useRef(autoNext);

  useEffect(() => {
    autoNextRef.current = autoNext;
  }, [autoNext]);

  useEffect(() => {
    if (!autoplay || paused || !inView || count <= 1) return;

    const id = window.setInterval(
      () => autoNextRef.current(),
      Math.max(1500, interval * 1000),
    );

    return () => window.clearInterval(id);
  }, [autoplay, paused, inView, count, interval]);

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
        "relative isolate flex w-full flex-col overflow-hidden bg-brand-navy-950",
        "min-h-[35rem] sm:min-h-[36rem]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src={baseSlide.src}
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
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand-navy-950/90 via-brand-navy-950/55 to-brand-navy-950/15"
        aria-hidden="true"
      />

      <Container className="relative flex flex-1 flex-col justify-end pt-20 pb-8 sm:pt-28 sm:pb-10 lg:pt-32 lg:pb-12">
        <motion.div
          key={indicatorIndex}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.25,
            ease: EASE,
          }}
          className="max-w-2xl text-white"
        >
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/80">
              {eyebrow}
            </p>
          )}

          {heading && (
            <h1
              className={cn(
                "text-balance break-words font-heading text-[30px] font-semibold leading-[1.08] tracking-[-0.01em] text-white sm:text-[40px] md:text-[44px] lg:text-[56px]",
                eyebrow && "mt-2.5 sm:mt-3",
              )}
            >
              {heading}
            </h1>
          )}

          {description && (
            <p className="mt-3 max-w-2xl text-pretty break-words text-[15px] leading-[1.6] text-white/90 sm:mt-5 sm:text-base md:text-lg md:leading-relaxed">
              {description}
            </p>
          )}

          {(eyebrow || heading || description) && (
            <div className="mt-6 sm:mt-7">
              {shownSlide.ctaText && shownSlide.ctaHref ? (
                <Link
                  href={shownSlide.ctaHref}
                  className={buttonStyles({ size: "lg" })}
                >
                  {shownSlide.ctaText}
                </Link>
              ) : (
                defaultActions
              )}
            </div>
          )}
        </motion.div>

        {showControls && canAnimate && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 sm:mt-8">
            <div className="flex flex-wrap items-center gap-1">
              {slides.map((slide, i) => {
                const active = i === indicatorIndex;
                const progressRunning =
                  active && autoplay && !paused && !reduceMotion;

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
                        "relative block h-1.5 overflow-hidden rounded-full duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] transition-[width,background-color]",
                        "group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-brand-navy-950",
                        active
                          ? "w-10 bg-white/35"
                          : "w-4 bg-white/50 group-hover:bg-white/80",
                      )}
                    >
                      {active && (
                        <motion.span
                          key={`progress-${indicatorIndex}-${progressRunning ? "run" : "idle"}`}
                          className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={
                            progressRunning
                              ? {
                                  duration: Math.max(1.5, interval),
                                  ease: "linear",
                                }
                              : {
                                  duration: reduceMotion ? 0 : 0.25,
                                  ease: EASE,
                                }
                          }
                        />
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
          Slide {indicatorIndex + 1} of {count}: {heading ?? shownSlide.alt}
        </p>
      </Container>
    </section>
  );
}
