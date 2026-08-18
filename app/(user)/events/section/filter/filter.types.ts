export type PriceFilter =
  | "all"
  | "free"
  | "paid";

export type DateFilter =
  | "all"
  | "upcoming"
  | "ongoing"
  | "past";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
};