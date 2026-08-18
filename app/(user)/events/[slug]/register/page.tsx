"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { LuUserRoundPlus, LuUserRoundMinus } from "react-icons/lu";
import { useAttendees } from "./_hooks/UseAttendees";
import AttendeeCard from "./_components/AttendeeCard";
import OrderSummary from "./_components/OrderSummary";
import ConfirmModal from "./_components/ConfirmModal";
import { AttendeeField, Event } from "./_type";

export default function EventRegisterPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [event, setEvent] = useState<Event | null>(null);
  const [fields, setFields] = useState<AttendeeField[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
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
  } = useAttendees(fields);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn();
      return;
    }
    if (status === "authenticated" && !session.user.emailVerified) {
      toast.error(
        "Please verify your email first before registering for events.",
      );
      router.push(`/events/${slug}`);
    }
  }, [status, session, router, slug]);

  useEffect(() => {
    fetch(`/api/events?slug=${slug}&published=true`)
      .then((r) => r.json())
      .then((d) => {
        const eventData = d.data;
        if (!eventData) {
          router.push("/events");
          return;
        }
        if (eventData.externalUrl) {
          router.replace(`/events/${slug}`);
          return;
        }
        if (eventData.endDate && new Date(eventData.endDate) < new Date()) {
          toast.error("This event has already ended");
          router.push(`/events/${slug}`);
          return;
        }
        if (d.soldOut) {
          toast.error("Sorry, this event is sold out");
          router.push(`/events/${slug}`);
          return;
        }
        setEvent(eventData);
      });
  }, [slug, router]);

  useEffect(() => {
    if (!event) return;
    fetch(`/api/events/${event.id}/attendee-fields`)
      .then((r) => r.json())
      .then((d) => setFields(d.data ?? []));
  }, [event]);

  const totalPrice = useMemo(() => {
    if (!event) return 0;
    return event.price * attendees.length;
  }, [event, attendees.length]);

  const handleConfirm = () => {
    if (!validateAll()) {
      toast.info("Please fix the errors before continuing");
      return;
    }
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    if (!event) return;
    setSubmitting(true);

    const res = await fetch("/api/orders/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event.id, attendees }),
    });

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 409) {
        toast.error("Sorry, tickets just sold out. Please try another event.");
        router.push(`/events/${slug}`);
        return;
      }
      toast.error(json.message || "Failed to process order");
      setSubmitting(false);
      return;
    }

    if (json.free) {
      router.push("/dashboard/my-ticket");
    } else {
      window.location.href = json.invoiceUrl;
    }
  };

  if (!event) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="mb-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">
            Registration
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {event.title}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Fill in the details for each attendee below
          </p>

          {session && (
            <button
              type="button"
              onClick={toggleMyself}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition my-6
                ${
                  isMyselfAdded
                    ? "text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                    : "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                }`}
            >
              {isMyselfAdded ? <LuUserRoundMinus /> : <LuUserRoundPlus />}
              {isMyselfAdded ? "Remove Myself" : "Add Myself"}
            </button>
          )}
        </div>

        {attendees.map((attendee, i) => (
          <AttendeeCard
            key={i}
            index={i}
            attendee={attendee}
            errors={errors[i]}
            fields={effectiveFields}
            isMyself={isMyselfAdded && i === myselfIndex}
            canRemove={attendees.length > 1}
            onChange={(val) => updateAttendee(i, val)}
            onRemove={() => removeAttendee(i)}
          />
        ))}

        <button
          onClick={addAttendee}
          className="w-full py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 text-sm font-medium transition flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          Add another attendee
        </button>
      </div>

      <OrderSummary
        event={event}
        attendeeCount={attendees.length}
        totalPrice={totalPrice}
        submitting={submitting}
        onConfirm={handleConfirm}
      />

      {showConfirm && (
        <ConfirmModal
          event={event}
          attendees={attendees}
          onConfirm={handleSubmit}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </section>
  );
}
