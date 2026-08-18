"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { timeZones } from "@/lib/timezone";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function TimeZoneSelect({
  value,
  onChange,
}: Props) {
  return (
    <Select
      value={value}
      onValueChange={(value) => {
        onChange(value ?? "Asia/Jakarta");
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>

      <SelectContent>
        {timeZones.map((tz) => (
          <SelectItem
            key={tz.value}
            value={tz.value}
          >
            {tz.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}