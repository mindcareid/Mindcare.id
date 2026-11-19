import type { PublicSponsorGroup } from "@/lib/sponsors/queries";

const SOLUTIONS_TIER_NAMES = new Set(["booth only", "space only"]);

function groupLabel(name: string): string {
  return SOLUTIONS_TIER_NAMES.has(name.trim().toLowerCase())
    ? "Solutions"
    : name;
}

export function GroupSponsors(groups: PublicSponsorGroup[]) {
  const merged = new Map<
    string,
    {
      key: string;
      label: string;
      sortOrder: number;
      sponsors: PublicSponsorGroup["sponsors"];
    }
  >();

  for (const group of groups) {
    const label = groupLabel(group.tierName);
    const existing = merged.get(label);

    if (existing) {
      existing.sponsors.push(...group.sponsors);
      existing.sortOrder = Math.min(existing.sortOrder, group.tierSortOrder);
    } else {
      merged.set(label, {
        key: label,
        label,
        sortOrder: group.tierSortOrder,
        sponsors: [...group.sponsors],
      });
    }
  }

  return [...merged.values()]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((group) => group.sponsors.length > 0);
}
