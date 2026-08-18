import type {
  DateFilter,
  PriceFilter,
  FilterOption,
} from "./filter.types";

export const PRICE_OPTIONS: readonly FilterOption<PriceFilter>[] = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "free",
    label: "Free",
  },
  {
    value: "paid",
    label: "Paid",
  },
];

export const DATE_OPTIONS: readonly FilterOption<DateFilter>[] = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "upcoming",
    label: "Upcoming",
  },
  {
    value: "ongoing",
    label: "Ongoing",
  },
  {
    value: "past",
    label: "Past",
  },
];