// lib/events/serializers.ts

type EventDetail = {
  quota: number | null;
};
export function toEventPlainText(value: string): string {
  return value
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li|h[1-6]|blockquote)\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

export function serializeEventDetail<T extends EventDetail>(
  event: T,
  soldCount: number,
  remaining: number | null,
  soldOut: boolean,
) {
  return {
    ...event,

    soldCount,
    remaining,
    soldOut,
  };
}