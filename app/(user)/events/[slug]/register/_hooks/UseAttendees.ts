"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { buildAttendeeSchema } from "@/lib/validations/auth";
import { AttendeeField, AttendeeFormValue } from "../_type";
const DEFAULT_ATTENDEE_FIELDS: AttendeeField[] = [
  { id: -1, label: "Full Name", key: "name", type: "TEXT", required: true },
  { id: -2, label: "Email", key: "email", type: "EMAIL", required: true },
  {
    id: -3,
    label: "Phone Number",
    key: "phone",
    type: "PHONE",
    required: true,
  },
];

export function useAttendees(fields: AttendeeField[]) {
  const { data: session } = useSession();

  const [attendees, setAttendees] = useState<AttendeeFormValue[]>([{}]);
  const [errors, setErrors] = useState<Record<string, string>[]>([{}]);

  const effectiveFields = useMemo(
    () => [...DEFAULT_ATTENDEE_FIELDS, ...fields],
    [fields],
  );

  const attendeeSchema = useMemo(
    () => buildAttendeeSchema(effectiveFields),
    [effectiveFields],
  );

  const validateAttendee = (
    data: AttendeeFormValue,
    index: number,
  ): boolean => {
    const result = attendeeSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (key) fieldErrors[key as string] = issue.message;
      }
      setErrors((prev) =>
        prev.map((err, i) => (i === index ? fieldErrors : err)),
      );
      return false;
    }
    setErrors((prev) => prev.map((err, i) => (i === index ? {} : err)));
    return true;
  };

  const validateAll = (): boolean =>
    attendees
      .map((attendee, i) => validateAttendee(attendee, i))
      .every(Boolean);

  const addAttendee = () => {
    setAttendees((a) => [...a, {}]);
    setErrors((e) => [...e, {}]);
  };

  const removeAttendee = (index: number) => {
    setAttendees((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAttendee = (index: number, val: AttendeeFormValue) => {
    setAttendees((prev) => prev.map((a, i) => (i === index ? val : a)));
    validateAttendee(val, index);
  };

  const myselfIndex = useMemo(() => {
    if (!session?.user?.email) return -1;
    return attendees.findIndex((a) => a.email === session.user.email);
  }, [attendees, session]);

  const isMyselfAdded = myselfIndex !== -1;

  const toggleMyself = () => {
    if (isMyselfAdded) {
      if (attendees.length === 1) {
        setAttendees([{}]);
        setErrors([{}]);
      } else {
        removeAttendee(myselfIndex);
      }
    } else {
      const profile = {
        name: session?.user?.name ?? "",
        email: session?.user?.email ?? "",
        phone: session?.user?.phonenumber ?? "",
      };
      const firstEmpty = attendees.findIndex(
        (a) => !a.name && !a.email && !a.phone,
      );
      if (firstEmpty !== -1) {
        setAttendees((prev) =>
          prev.map((a, i) => (i === firstEmpty ? { ...a, ...profile } : a)),
        );
      } else {
        setAttendees((a) => [...a, profile]);
        setErrors((e) => [...e, {}]);
      }
    }
  };

  return {
    attendees,
    errors,
    effectiveFields,
    myselfIndex,
    isMyselfAdded,
    validateAll,
    addAttendee,
    removeAttendee,
    updateAttendee,
    toggleMyself,
  };
}
