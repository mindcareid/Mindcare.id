import { waitUntil } from "@vercel/functions";
export function runAfterResponse(task: Promise<unknown>): void {
  const safe = task.catch((err) => {
    console.error("[afterResponse] background task failed:", err);
  });

  try {
    waitUntil(safe);
  } catch {
    void safe;
  }
}
