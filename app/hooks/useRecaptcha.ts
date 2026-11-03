"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

const SCRIPT_ID = "google-recaptcha-v3";
function siteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || undefined;
}

export function useRecaptcha(action: string) {
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const [enabled] = useState(() => Boolean(siteKey()));

  useEffect(() => {
    const key = siteKey();
    if (!key) return;

    function markReady() {
      readyRef.current = true;
      setReady(true);
    }

    if (window.grecaptcha) {
      window.grecaptcha.ready(markReady);
      return;
    }

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `https://www.google.com/recaptcha/api.js?render=${key}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    const timer = window.setInterval(() => {
      if (window.grecaptcha) {
        window.clearInterval(timer);
        window.grecaptcha.ready(markReady);
      }
    }, 200);

    return () => window.clearInterval(timer);
  }, []);

  const execute = useCallback(async (): Promise<string | undefined> => {
    const key = siteKey();
    if (!key || !readyRef.current || !window.grecaptcha) {
      return undefined;
    }

    try {
      return await window.grecaptcha.execute(key, { action });
    } catch (error) {
      console.error("[RECAPTCHA_EXECUTE_ERROR]", error);
      return undefined;
    }
  }, [action]);

  return { enabled, ready, execute };
}
