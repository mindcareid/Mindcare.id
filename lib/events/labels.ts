const EVENT_FORMAT_LABELS: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "In person",
  HYBRID: "Hybrid",
};

export function eventFormatLabel(format: string): string {
  return EVENT_FORMAT_LABELS[format] ?? format;
}
