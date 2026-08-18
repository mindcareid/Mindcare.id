export type FieldType =
  | "TEXT"
  | "EMAIL"
  | "PHONE"
  | "NUMBER"
  | "DATE"
  | "SELECT";

export type Field = {
  id?: string;
  label: string;
  key: string;
  type: FieldType;
  required: boolean;
  options: string[];
  order: number;
};

export type Props = {
  companyId: string;
  eventId: string;
  initialFields?: Field[];
};

export const FIELD_TYPES: { label: string; value: FieldType }[] = [
  { label: "Text", value: "TEXT" },
  { label: "Email", value: "EMAIL" },
  { label: "Phone", value: "PHONE" },
  { label: "Number", value: "NUMBER" },
  { label: "Date", value: "DATE" },
  { label: "Select", value: "SELECT" },
];

export const emptyField = (): Field => ({
  label: "",
  key: "",
  type: "TEXT",
  required: false,
  options: [],
  order: 0,
});
