"use client";

import { MdEmail } from "react-icons/md";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { AttendeeFormValue, Event } from "../_type";

type Props = {
  event: Event;
  attendees: AttendeeFormValue[];
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({
  event,
  attendees,
  onConfirm,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-2xl flex justify-center items-center font-bold text-gray-900">
            Confirm Registration
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tickets will be sent to the email(s) below. Please double-check
            before continuing.
          </p>
        </div>

        <div className="px-6 py-4 space-y-3 max-h-64 overflow-y-auto">
          {attendees.map((attend, i) => (
            <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 text-base">
              <p className="font-semibold text-gray-800">
                Attendee {i + 1} — {attend.name}
              </p>
              <div className="flex items-center gap-1">
                <MdEmail className="self-center shrink-0" />
                <p className="text-gray-500">{attend.email}</p>
              </div>
              <div className="flex items-center gap-1">
                <IoPhonePortraitOutline className="self-center shrink-0" />
                <p className="text-gray-500">{attend.phone}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
          <p className="text-sm text-amber-700 text-center">
            ⚠️ Make sure the email is correct — tickets cannot be resent to a
            different address.
          </p>
        </div>

        <div className="px-6 py-5 flex flex-col md:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Review Again
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition active:scale-[0.98]"
          >
            {event.price === 0
              ? "Complete Registration"
              : "Proceed to Payment →"}
          </button>
        </div>
      </div>
    </div>
  );
}
