"use client";

import AttendeeDynamicForm from "@/app/components/AttendeeDynamicForm";
import { AttendeeField, AttendeeFormValue } from "../_type";

type Props = {
  index: number;
  attendee: AttendeeFormValue;
  errors: Record<string, string>;
  fields: AttendeeField[];
  isMyself: boolean;
  canRemove: boolean;
  onChange: (val: AttendeeFormValue) => void;
  onRemove: () => void;
};

export default function AttendeeCard({
  index,
  attendee,
  errors,
  fields,
  isMyself,
  canRemove,
  onChange,
  onRemove,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <h3 className="font-semibold text-gray-800">Attendee #{index + 1}</h3>
          {isMyself && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
              You
            </span>
          )}
        </div>

        {canRemove && (
          <button
            onClick={onRemove}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition"
          >
            Remove
          </button>
        )}
      </div>

      <div className="px-6 py-5">
        <AttendeeDynamicForm
          fields={fields}
          value={attendee}
          errors={errors}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
