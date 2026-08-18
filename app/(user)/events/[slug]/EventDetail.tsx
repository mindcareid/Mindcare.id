"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  formatDate,
  formatDateShort,
  formatTimeOnly,
  getTimeZoneLabel,
} from "@/lib/utils/FormatDate";
import { FiMapPin } from "react-icons/fi";
import { FaCalendarDays } from "react-icons/fa6";
import {
  IoImageOutline,
  IoCloseOutline,
  IoTicketSharp,
  IoArrowBack,
} from "react-icons/io5";
import {
  MdFullscreen,
  MdFullscreenExit,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowUp,
  MdOutlineKeyboardArrowDown,
  MdOutlineMail,
} from "react-icons/md";
import ShareButton from "../section/ShareButton";
import { AnimatePresence, motion } from "framer-motion";
import TicketFormatModal from "../section/TicketModal";
import { Ticket } from "../type/company";
import { FaRegClock } from "react-icons/fa";
import { toast } from "sonner";
import type { EventItem } from "@/lib/events/types";
import Portal from "@/app/(user)/events/components/Portal";
import FAQItem from "../section/FaqItems";
import { getFaqItems } from "../data/faq";

type Props = {
  event: EventItem;
};

export default function EventDetailPage({ event }: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  const totalEvents = event.totalCompanyEvents ?? 0;
  const isSoldOut = event.soldOut ?? false;
  const remaining = event.remaining ?? null;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const faqItems = useMemo(() => getFaqItems(event.title), [event.title]);
  const isFree = event?.price === 0;
  const now = new Date();
  const eventEnded = event?.endDate ? new Date(event.endDate) < now : false;

  const externalUrl = event?.externalUrl ?? null;
  const isExternal = Boolean(externalUrl);
  const showSeatInfo = Boolean(event.quota) && !eventEnded && !isExternal;
  /* ================= FETCH USER TICKETS ================= */
  useEffect(() => {
    if (!session?.user?.id || !event) return;

    const fetchTickets = async () => {
      try {
        const res = await fetch(`/api/tickets?eventId=${event.id}`);
        if (!res.ok) return;

        const json = await res.json();
        setTickets(json.tickets ?? []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTickets();
  }, [session?.user?.id, event]);

  /* ================= DERIVED ================= */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pendingTicket = useMemo(
    () => tickets.find((t) => t.order.status === "PENDING"),
    [tickets],
  );

  /* ================= ACTION ================= */
  const handleBuyTicket = () => {
    if (eventEnded || isSoldOut) return;

    if (externalUrl) {
      window.open(externalUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (!session) return signIn();

    if (!session.user.emailVerified) {
      toast.error("Please verify your email before registering.", {
        description: "Check your inbox or check your profile settings.",
        // action: {
        //   label: "Resend Email",
        //   onClick: async () => {
        //     const res = await fetch("/api/auth/resend-verification", {
        //       method: "POST",
        //     });
        //     const data = await res.json();
        //     if (res.ok) {
        //       toast.success(data.message || "Verification email resent!");
        //     } else {
        //       toast.error(
        //         data.message || "failed to resend verification email.",
        //       );
        //     }
        //   },
        // },
      });
      return;
    }

    router.push(`/events/${event?.slug}/register`);
  };

  /* ================= STATES ================= */
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Event not found
      </div>
    );
  }

  return (
    <article className="bg-white min-h-screen pb-24 lg:pb-0">
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/events")}
          className="flex items-center gap-2 text-gray-700"
        >
          <IoArrowBack className="w-5 h-5" />
        </button>

        <ShareButton title={event.title} />
      </div>

      <section className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[2fr_1fr] gap-12">
        <div className="space-y-12 order-2 lg:order-1">
          <div>
            <div className="hidden md:flex items-center gap-2 text-base px-2 text-gray-900 mb-6">
              <Link href="/" className="hover:text-blue-600 transition">
                Home
              </Link>
              <MdOutlineKeyboardArrowRight className="w-4 h-4" />

              <Link href="/events" className="hover:text-blue-600 transition">
                Events
              </Link>

              <MdOutlineKeyboardArrowRight className="w-4 h-4" />

              <span className="text-gray-900 font-medium">{event.title}</span>
            </div>
            <div className="my-4 rounded-2xl border border-gray-100 bg-gray-100  hover:shadow-md  p-5">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">
                {event.title}
              </h1>

              <div className="mt-3 flex items-center gap-2">
                <div className="shrink-0">
                  <Image
                    src={
                      typeof event.company?.logo === "string" &&
                      event.company.logo
                        ? event.company.logo
                        : "/images/no-image.png"
                    }
                    alt={event.company?.name || "Company"}
                    width={40}
                    height={40}
                    unoptimized
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/partners/${event.company.slug}`}
                    className="text-base text-gray-600 hover:text-gray-700 underline truncate cursor-pointer "
                  >
                    {event.company.name}
                  </Link>
                  <MdOutlineKeyboardArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="my-4 rounded-2xl border border-gray-100 bg-gray-100 hover:shadow-md  p-5">
              <h1 className="text-lg font-bold">Location & Date Time </h1>
              {event.location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 group"
                >
                  <FiMapPin className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition" />

                  <span className="text-base text-gray-900 leading-snug group-hover:underline">
                    {event.location}
                  </span>
                  <span className="hidden md:inline text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition">
                    View on map →
                  </span>
                </a>
              )}

              <div className="flex items-center gap-2  ">
                <FaCalendarDays className="w-3 h-3" />
                <span className="text-base text-gray-900 ">
                  {formatDate(event.startDate, event.timeZone)} -{" "}
                  {formatDate(event.endDate, event.timeZone)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaRegClock className="w-3 h-3" />
                <span className="text-base text-gray-900">
                  {formatTimeOnly(event.startDate, event.timeZone)}-{" "}
                  {formatTimeOnly(event.endDate, event.timeZone)}{" "}
                  {getTimeZoneLabel(event.startDate, event.timeZone)}
                </span>
              </div>
            </div>
            <div className="my-4 rounded-2xl border border-gray-100 bg-gray-100  hover:shadow-md p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full inline-block" />
                About This Event
              </h2>

              <div>
                <motion.div
                  initial={false}
                  animate={{ height: expanded ? "auto" : "4.5rem" }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden text-gray-600 leading-relaxed "
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: event.description || "",
                    }}
                  />
                </motion.div>

                <motion.button
                  onClick={() => setExpanded(!expanded)}
                  whileTap={{ scale: 0.95 }}
                  className="mt-2 mx-auto flex items-center gap-1 text-base font-medium text-blue hover:underline"
                >
                  {expanded ? "Show less" : "Show more"}

                  {expanded ? (
                    <MdOutlineKeyboardArrowUp className="w-4 h-4" />
                  ) : (
                    <MdOutlineKeyboardArrowDown className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 my-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full inline-block" />
                More Details About This Event
              </h2>
              <div>
                <motion.div
                  onClick={() => setOpen(true)}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between gap-2 p-3 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <IoTicketSharp className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-800">
                      Ticket format you&apos;ll receive after booking
                    </span>
                  </div>

                  <motion.span animate={{ rotate: open ? 180 : 0 }}>
                    <MdOutlineKeyboardArrowDown className="w-5 h-5 text-gray-500" />
                  </motion.span>
                </motion.div>
                <TicketFormatModal open={open} setOpen={setOpen} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 my-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full inline-block" />
                About Company
              </h2>
              <div className="my-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:bg-gray-100 hover:shadow-sm">
                <div className="flex items-start gap-4">
                  <Image
                    src={
                      typeof event.company?.logo === "string" &&
                      event.company.logo
                        ? event.company.logo
                        : "/images/no-image.png"
                    }
                    alt={event.company?.name || "Company"}
                    width={100}
                    height={150}
                    className="rounded-xl object-contain  border border-gray-100 p-1"
                    unoptimized
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Organized by</p>

                    <p className="font-semibold text-gray-900 truncate">
                      {event.company.name}
                    </p>

                    {event.company.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <FiMapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">
                          {event.company.location}
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaCalendarDays className="w-3 h-3" />
                        {totalEvents} events published
                      </span>

                      <span className="flex items-center gap-1">
                        <FaCalendarDays className="w-3 h-3" />
                        Joined {formatDateShort(event.company.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Button */}
                <Link
                  href={`/partners/${event.company.slug}`}
                  className="mt-4 flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                >
                  View Company Details
                </Link>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <h2 className="text-xl font-bold mb-4">
                  Frequently Asked Questions
                </h2>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  {faqItems.map((item, i) => (
                    <FAQItem
                      key={i}
                      question={item.question}
                      answer={item.answer}
                    />
                  ))}
                </motion.div>
                <Link href={"/#contact"}>
                  <button className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition cursor-pointer">
                    <MdOutlineMail />
                    Need help? Contact support
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Tickets */}
          {tickets.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-green-500 rounded-full inline-block" />
                Your Tickets
              </h3>
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between bg-green-50 border border-green-100 rounded-2xl px-5 py-4 hover:shadow-sm transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {ticket.attendeeData.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {ticket.attendeeData.email}
                      </p>
                      <span className="inline-block mt-1.5 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {ticket.order.status}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-mono text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-700">
                        {ticket.code}
                      </span>
                      <Link
                        href="/dashboard/my-ticket"
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        View Ticket →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4 order-1 lg:order-2">
          <div className="sticky top-6 rounded-2xl overflow-hidden border border-gray-200 shadow-sm my-12 mx-auto">
            <div
              className="relative cursor-pointer group"
              onClick={() => setPhotoOpen(true)}
            >
              <Image
                src={
                  typeof event.coverImage === "string" && event.coverImage
                    ? event.coverImage
                    : "/images/no-image.png"
                }
                alt={event.company.name}
                width={600}
                height={400}
                unoptimized
                className="w-full h-full object-contain "
              />

              <motion.span
                // whileHover={{ scale: 1.05 }}
                className="absolute bottom-3 right-3 text-white text-xs font-semibold flex items-center gap-1.5 bg-black/60  px-3 py-1.5 rounded-full border border-white/20"
              >
                <IoImageOutline className="w-4 h-4" />
                See photos
              </motion.span>
            </div>

            <div className="hidden lg:flex  bg-white px-5 py-4  items-center justify-between gap-4">
              <div className="flex items-center justify-center gap-2">
                <p className="text-xs text-gray-400">Price</p>
                <p className="text-base font-bold text-gray-900">
                  {isFree ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `Rp ${event.price.toLocaleString("id-ID")}`
                  )}
                </p>
              </div>
              {/* BUY TICKET BUTTON — satu komponen, responsive */}
              <div className="hidden lg:flex bg-white px-5 py-4 items-center justify-between gap-4">
                <div className="flex flex-col items-start gap-1.5">
                  <button
                    onClick={handleBuyTicket}
                    disabled={eventEnded || isSoldOut}
                    className={`
        inline-flex items-center gap-2 font-medium text-sm px-5 py-2.5
        rounded-full border-none transition-all duration-150 whitespace-nowrap
        ${
          eventEnded
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : isSoldOut
              ? "bg-gray-100 text-red-400 cursor-not-allowed"
              : "bg-blue-600 hover:opacity-90 active:scale-95 text-white"
        }
      `}
                  >
                    {eventEnded
                      ? "Event Ended"
                      : isSoldOut
                        ? "Sold Out"
                        : isExternal
                          ? "Go To Registration Link ↗"
                          : !session
                            ? "Login to Continue"
                            : isFree
                              ? "Register Event"
                              : "Buy Tickets →"}
                  </button>

                  {showSeatInfo && (
                    <span
                      className={`flex items-center gap-1 text-xs  ${isSoldOut ? "text-red-500 self-center" : "text-gray-400 self-center"}`}
                    >
                      {isSoldOut
                        ? " "
                        : remaining !== null
                          ? `${remaining} of ${event.quota} remaining`
                          : `${event.quota} seats`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden md:flex bg-gray-50 border-t border-gray-100 px-5 py-3  items-center justify-between">
              <p className="text-xs text-gray-500">
                Share with the people you&apos;d go with!
              </p>
              <ShareButton title={event.title} />
            </div>
          </div>
        </aside>
      </section>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 px-6 py-4 flex justify-between items-center lg:hidden z-50">
        <div>
          <p className="text-xs text-gray-400">Price</p>
          <p className="font-bold text-gray-900">
            {isFree ? (
              <span className="text-green-600">Free</span>
            ) : (
              `Rp ${event.price.toLocaleString("id-ID")}`
            )}
          </p>
          {showSeatInfo && (
            <p
              className={`text-xs mt-0.5 ${isSoldOut ? "text-red-500" : "text-gray-400"}`}
            >
              {isSoldOut
                ? " "
                : remaining !== null
                  ? `${remaining} of ${event.quota} remaining`
                  : `${event.quota} seats`}
            </p>
          )}
        </div>

        <button
          onClick={handleBuyTicket}
          disabled={eventEnded || isSoldOut}
          className={`
      inline-flex items-center gap-2 font-medium text-sm px-5 py-2.5
      rounded-full border-none transition-all duration-150 whitespace-nowrap
      ${
        eventEnded
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : isSoldOut
            ? "bg-gray-100 text-red-400 cursor-not-allowed"
            : "bg-blue-600 hover:opacity-90 active:scale-95 text-white"
      }
    `}
        >
          {eventEnded
            ? "Event Ended"
            : isSoldOut
              ? "Sold Out"
              : isExternal
                ? "Go To Registration Link ↗"
                : !session
                  ? "Login to Continue"
                  : isFree
                    ? "Register Event"
                    : "Buy Tickets →"}
        </button>
      </div>
      <AnimatePresence>
        {photoOpen && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
              onClick={() => setPhotoOpen(false)}
            >
              <div className="absolute top-4 right-4 flex items-center gap-2 z-9999 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullscreen((p) => !p);
                  }}
                  className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20  p-2 rounded-lg transition"
                >
                  {isFullscreen ? (
                    <MdFullscreenExit className="w-5 h-5" />
                  ) : (
                    <MdFullscreen className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setPhotoOpen(false);
                    setIsFullscreen(false);
                  }}
                  className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-lg transition"
                >
                  <IoCloseOutline className="w-5 h-5" />
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`relative transition-all duration-300 ${
                  isFullscreen ? "w-full h-screen p-0" : "max-w-4xl w-full mx-4"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={event.coverImage || "/images/no-image.png"}
                  alt={event.title}
                  width={1200}
                  height={630}
                  unoptimized
                  className={`shadow-2xl object-contain transition-all duration-300 ${
                    isFullscreen
                      ? "w-full h-auto max-h-screen rounded-xl"
                      : "w-full h-auto max-h-[80vh] rounded-2xl"
                  }`}
                />
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </article>
  );
}
