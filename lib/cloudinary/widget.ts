import type { CloudinaryGlobal } from "./types/cloudinary";
export const CLOUDINARY_WIDGET_SRC =
  "https://widget.cloudinary.com/v2.0/global/all.js";

const POLL_INTERVAL_MS = 100;
const LOAD_TIMEOUT_MS = 15_000;

function readGlobal(): CloudinaryGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  const sdk = window.cloudinary;
  return typeof sdk?.createUploadWidget === "function" ? sdk : undefined;
}

let loadingPromise: Promise<CloudinaryGlobal> | null = null;

function loadWidgetSdk(): Promise<CloudinaryGlobal> {
  return new Promise<CloudinaryGlobal>((resolve, reject) => {
    const selector = `script[data-cloudinary-widget='true'], script[src="${CLOUDINARY_WIDGET_SRC}"]`;
    let script = document.querySelector<HTMLScriptElement>(selector);

    if (!script) {
      script = document.createElement("script");
      script.src = CLOUDINARY_WIDGET_SRC;
      script.async = true;
      script.dataset.cloudinaryWidget = "true";
      document.head.appendChild(script);
    }

    const attachedScript = script;
    let settled = false;

    const stop = () => {
      window.clearInterval(poll);
      window.clearTimeout(timeout);
      attachedScript.removeEventListener("error", onError);
    };

    const onSuccess = (sdk: CloudinaryGlobal) => {
      if (settled) return;
      settled = true;
      stop();
      resolve(sdk);
    };

    const onFailure = (message: string) => {
      if (settled) return;
      settled = true;
      stop();
      loadingPromise = null;
      reject(new Error(message));
    };

    const poll = window.setInterval(() => {
      const sdk = readGlobal();
      if (sdk) onSuccess(sdk);
    }, POLL_INTERVAL_MS);

    const timeout = window.setTimeout(() => {
      onFailure(
        "Cloudinary upload widget could not be loaded. Check your connection (or ad blocker) and try again.",
      );
    }, LOAD_TIMEOUT_MS);

    const onError = () =>
      onFailure("Cloudinary upload widget could not be downloaded.");

    attachedScript.addEventListener("error", onError);
  });
}

export function ensureCloudinaryWidget(): Promise<CloudinaryGlobal> {
  const existing = readGlobal();
  if (existing) return Promise.resolve(existing);

  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(
      new Error("Cloudinary upload widget is only available in the browser."),
    );
  }

  if (!loadingPromise) loadingPromise = loadWidgetSdk();
  return loadingPromise;
}
