export interface TimeZoneOption {
  value: string;
  label: string;
}

export const timeZones: TimeZoneOption[] = [
  {
    value: "Asia/Jakarta",
    label: "🇮🇩 Indonesia (WIB)",
  },
  {
    value: "Asia/Makassar",
    label: "🇮🇩 Indonesia (WITA)",
  },
  {
    value: "Asia/Jayapura",
    label: "🇮🇩 Indonesia (WIT)",
  },
  {
    value: "Asia/Singapore",
    label: "🇸🇬 Singapore",
  },
  {
    value: "Asia/Kuala_Lumpur",
    label: "🇲🇾 Malaysia",
  },
  {
    value: "Asia/Bangkok",
    label: "🇹🇭 Thailand",
  },
  {
    value: "Asia/Manila",
    label: "🇵🇭 Philippines",
  },
  {
    value: "Asia/Tokyo",
    label: "🇯🇵 Japan",
  },
  {
    value: "Asia/Seoul",
    label: "🇰🇷 Korea",
  },
  {
    value: "Australia/Sydney",
    label: "🇦🇺 Australia",
  },
  {
    value: "Europe/London",
    label: "🇬🇧 London",
  },
  {
    value: "Europe/Paris",
    label: "🇫🇷 Paris",
  },
  {
    value: "America/New_York",
    label: "🇺🇸 New York",
  },
  {
    value: "America/Los_Angeles",
    label: "🇺🇸 Los Angeles",
  },
];

export function detectTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getDefaultTimeZone() {
  const detected = detectTimeZone();

  return (
    timeZones.find((t) => t.value === detected)?.value ??
    "Asia/Jakarta"
  );
}