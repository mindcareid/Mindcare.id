export type Event = {
  id: number;
  title: string;
  price: number;
  endDate: string | null;
  externalUrl?: string | null;
};

export type AttendeeField = {
  id: number;
  label: string;
  key: string;
  type: "TEXT" | "EMAIL" | "PHONE" | "SELECT" | "TEXTAREA";
  required: boolean;
  options?: string[];
};

export type AttendeeValue = string | number | boolean | null;
export type AttendeeFormValue = Record<string, AttendeeValue>;
