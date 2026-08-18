"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef } from "react";
import type { Industry } from "@/lib/events/types";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface VerticalMarqueeProps {
  children: ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  speed?: number;
  onItemsRef?: (items: HTMLElement[]) => void;
}

interface CTAWithVerticalMarqueeProps {
  industries: Industry[];
}

function VerticalMarquee({
  children,
  pauseOnHover = false,
  reverse = false,
  className,
  speed = 30,
  onItemsRef,
}: VerticalMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onItemsRef && containerRef.current) {
      const items = Array.from(
        containerRef.current.querySelectorAll(".marquee-item"),
      ) as HTMLElement[];
      onItemsRef(items);
    }
  }, [onItemsRef]);

  return (
    <div
      ref={containerRef}
      className={cn("group flex flex-col overflow-hidden", className)}
      style={
        {
          "--duration": `${speed}s`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "flex shrink-0 flex-col animate-marquee-vertical",
          reverse && "shimmer-reverse",
          pauseOnHover && "group-hover:paused",
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 flex-col animate-marquee-vertical",
          reverse && "shimmer-reverse",
          pauseOnHover && "group-hover:paused",
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

export default function CTAWithVerticalMarquee({
  industries,
}: CTAWithVerticalMarqueeProps) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const exploreHref = isLoggedIn ? "/events" : "/auth/login";
  const hostHref = isLoggedIn ? "/company/create" : "/auth/register";
  const marqueeRef = useRef<HTMLDivElement>(null);

  const marqueeItems = industries.map((industry) => industry.name);
  const secondsPerItem = 4;
  const marqueeSpeed = Math.max(marqueeItems.length * secondsPerItem, 15);
  useEffect(() => {
    const marqueeContainer = marqueeRef.current;
    if (!marqueeContainer) return;
    let frameId: number;
    const updateOpacity = () => {
      const items = marqueeContainer.querySelectorAll(".marquee-item");
      const containerRect = marqueeContainer.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(centerY - itemCenterY);
        const maxDistance = containerRect.height / 2;
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        const opacity = 1 - normalizedDistance * 0.75;
        (item as HTMLElement).style.opacity = opacity.toString();
      });
      frameId = requestAnimationFrame(updateOpacity);
    };
    frameId = requestAnimationFrame(updateOpacity);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-12 overflow-hidden">
      <div className="w-full max-w-7xl animate-fade-in-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-8 max-w-xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium leading-tight tracking-tight text-foreground ">
              Find Events, Secure Your Ticket.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              From concerts to conferences browse events, pick your ticket, and
              show up. Everything in one place.
            </p>
            <div className="flex flex-wrap gap-4 ">
              <Link
                href={exploreHref}
                className="group relative px-6 py-3 bg-foreground text-background rounded-md font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg inline-block"
              >
                <span className="relative z-10">EXPLORE EVENTS</span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              </Link>
              <Link
                href={hostHref}
                className="group relative px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg border border-border inline-block"
              >
                <span className="relative z-10">HOST YOUR EVENT</span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              </Link>
            </div>
          </div>

          <div
            ref={marqueeRef}
            className="relative h-150 lg:h-175 flex items-center justify-center "
          >
            <div className="relative w-full h-full">
              <VerticalMarquee speed={marqueeSpeed} className="h-full">
                {marqueeItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-4xl md:text-5xl lg:text-6xl  font-light tracking-tight py-8 marquee-item"
                  >
                    {item}
                  </div>
                ))}
              </VerticalMarquee>

              <div className="pointer-events-none absolute top-0 left-0 right-0 h-64 bg-linear-to-b from-background via-background/50 to-transparent z-10"></div>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-64 bg-linear-to-t from-background via-background/50 to-transparent z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
