"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

interface TicketFormatModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function TicketFormatModal({
  open,
  setOpen,
}: TicketFormatModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Ticket Format Info</h2>
              <IoClose
                className="w-5 h-5 cursor-pointer"
                onClick={() => setOpen(false)}
              />
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <p className="font-semibold">Execorner e-Ticket</p>

              <p>
                After completing your booking through the website, your e-ticket
                will be sent to your email and can also be accessed from the{" "}
                <b>Booking Menu</b> on your dashboard.
              </p>

              <p className="italic">
                Setelah menyelesaikan pemesanan melalui website, e-ticket kamu
                akan dikirim ke email dan juga dapat diakses melalui menu{" "}
                <b>Booking</b> di dashboard user.
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-full border border-teal-500 py-2 text-teal-600 hover:bg-teal-50"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
