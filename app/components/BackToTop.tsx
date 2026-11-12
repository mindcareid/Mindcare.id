"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
export default function BackToTop({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      setVisible(window.scrollY > 400);
    };
    toggleVisible();

    window.addEventListener("scroll", toggleVisible, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollTop}
      className={[
        className,
        "transition-all duration-300",
        visible
          ? "pointer-events-auto opacity-100 translate-y-0"
          : "pointer-events-none opacity-0 translate-y-12",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </button>
  );
}
