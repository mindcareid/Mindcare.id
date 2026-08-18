"use client";

import { Event } from "../_type";

type Props = {
  event: Event;
  attendeeCount: number;
  totalPrice: number;
  submitting: boolean;
  onConfirm: () => void;
};

export default function OrderSummary({
  event,
  attendeeCount,
  totalPrice,
  submitting,
  onConfirm,
}: Props) {
  return (
    <aside className="lg:sticky lg:top-24 h-fit">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Order Summary</h2>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-blue-50 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-400 mb-0.5">Event</p>
            <p className="text-sm font-semibold text-blue-800 line-clamp-2">
              {event.title}
            </p>
          </div>

          <div className="space-y-2.5 text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <span>Price per person</span>
              <span className="font-medium text-gray-800">
                {event.price === 0
                  ? "Free"
                  : `Rp.${event.price.toLocaleString("id-ID")}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Participants</span>
              <span className="font-medium text-gray-800">
                {attendeeCount} {attendeeCount === 1 ? "person" : "people"}
              </span>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-blue-600">
              {event.price === 0
                ? "Free"
                : `Rp.${totalPrice.toLocaleString("id-ID")}`}
            </span>
          </div>

          <button
            onClick={onConfirm}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Processing...
              </>
            ) : event.price === 0 ? (
              "Complete Registration"
            ) : (
              "Proceed to Payment →"
            )}
          </button>

          <p className="text-sm text-center text-gray-400">
            🔒 Your data is safe and encrypted
          </p>
        </div>
      </div>
    </aside>
  );
}
