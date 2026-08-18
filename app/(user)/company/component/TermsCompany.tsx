"use client";

import TermsSectionItem from "@/app/auth/component/TermsSectionItem";
import { execornerTerms } from "@/app/auth/data/TermsSection";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoIosArrowRoundDown } from "react-icons/io";

export default function TermsCompany({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scroll, setScroll] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setScrolled(false);
      setScroll(0);
      scrollRef.current?.scrollTo({ top: 0 });
    }
  }, [open]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const progress = max > 0 ? (el.scrollTop / max) * 100 : 100;
    setScroll(Math.min(progress, 100));
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 16) {
      setScrolled(true);
    }
  };

  const handleAccept = () => {
    onChange(true);
    setOpen(false);
  };
  const handleDecline = () => {
    onChange(false);
    setOpen(false);
  };

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-9999 bg-black/40 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            className="fixed inset-x-0 bottom-0 z-9999 flex flex-col bg-white rounded-t-2xl shadow-2xl sm:inset-0 sm:m-auto sm:rounded-2xl sm:max-w-4xl sm:max-h-[85vh] sm:h-auto"
            style={{ maxHeight: "92dvh" }}
            initial={{ y: "6%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "6%", opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 sm:px-6 sm:pt-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                  Terms & Conditions
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  Last updated 30 January 2026
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="none">
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="mx-5 sm:mx-6 h-0.5 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                animate={{ scaleX: scroll / 100 }}
                style={{ transformOrigin: "left" }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Intro */}
            <div className="mx-5 sm:mx-6 mt-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-lg text-gray-500 leading-relaxed">
              Please read the full Terms before accepting. Scroll to the bottom
              to enable the{" "}
              <span className="font-medium text-gray-700">Accept</span> button.
            </div>

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-4 space-y-8 text-base"
            >
              {execornerTerms.parts.map((part) => (
                <div key={part.part}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                    {part.part} — {part.title}
                  </p>
                  <div className="space-y-5">
                    {part.sections.map((section, i) => (
                      <TermsSectionItem
                        key={section.number ?? i}
                        section={section}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {!scrolled && (
                <motion.div
                  className="mx-5 sm:mx-6 mb-2 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                >
                  <IoIosArrowRoundDown className="text-amber-600" />
                  <p className="text-xs text-amber-600">
                    Scroll to the bottom to enable Accept
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleDecline}
                className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Decline
              </button>

              <motion.button
                type="button"
                onClick={handleAccept}
                disabled={!scrolled}
                whileTap={scrolled ? { scale: 0.97 } : {}}
                className={`text-sm font-medium px-6 py-2 rounded-xl transition-colors duration-200 ${
                  scrolled
                    ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                I Accept
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Trigger */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open terms and conditions"
          className={`mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
            checked
              ? "bg-blue-600 border-blue-600"
              : "border-gray-300 hover:border-blue-400 bg-white"
          }`}
        >
          <AnimatePresence>
            {checked && (
              <motion.svg
                key="check"
                viewBox="0 0 10 8"
                className="w-2.5 h-2.5 text-white"
                fill="none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <path
                  d="M1 4l3 3 5-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>

        <p className="text-sm text-gray-600 leading-relaxed select-none">
          I have read and agree to the{" "}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-medium transition-colors"
          >
            Terms and Conditions
          </button>
        </p>
      </div>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
