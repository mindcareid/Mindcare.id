"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { IoTicketSharp } from "react-icons/io5";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import TicketFormatModal from "./TicketModal";

export default function TicketInfo() {
  const [open, setOpen] = useState(false);

  return (
    <>
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
    </>
  );
}
