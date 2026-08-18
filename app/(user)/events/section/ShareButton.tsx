"use client";

import { useState } from "react";
import {
  FiShare2,
  FiCheck,
  FiX,
  FiLink,
  FiMoreHorizontal,
} from "react-icons/fi";
import {
  FaWhatsapp,
  FaFacebook,
  FaTelegramPlane,
  FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { toast } from "sonner";

type Props = {
  title: string;
  url?: string;
  iconOnly?: boolean;
  context?: "event" | "article";
};

export default function ShareButton({
  title,
  url,
  iconOnly = false,
  context = "event",
}: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "");

  const shareText =
    context === "article"
      ? `${title}  Read on Execorner. ${shareUrl}`
      : `Check out ${title} on Execorner. ${shareUrl}`;

  const modalTitle =
    context === "article" ? "Share this Article" : "Share this Event";

  const toastDescription =
    context === "article"
      ? "You can now share this article"
      : "You can now share this event";

  const shareLinks = [
    {
      label: "WhatsApp",
      icon: <FaWhatsapp size={24} />,
      color: "bg-green-500",
      href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    },
    {
      label: "LinkedIn",
      icon: <FaLinkedin size={24} />,
      color: "bg-blue-700",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "X",
      icon: <FaXTwitter size={24} />,
      color: "bg-black",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `Check out ${title}`,
      )}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "Facebook",
      icon: <FaFacebook size={24} />,
      color: "bg-blue-600",
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    },
    {
      label: "Telegram",
      icon: <FaTelegramPlane size={24} />,
      color: "bg-sky-500",
      href: `https://t.me/share/url?url=${shareUrl}&text=${encodeURIComponent(title)}`,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Link copied to clipboard!", {
        description: toastDescription,
      });
      setTimeout(() => {
        setOpen(false);
      }, 800);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log(err, "Share cancelled");
      }
    } else {
      alert("Sharing not supported on this device");
    }
  };

  const overlay = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modal: Variants = {
    hidden: {
      opacity: 0,
      y: 40,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.96,
      transition: {
        duration: 0.15,
        ease: "easeIn",
      },
    },
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition"
      >
        <FiShare2 />
        {!iconOnly && ""}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              variants={overlay}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/30  z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              variants={modal}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92%] max-w-xl bg-white rounded-2xl shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <p className="font-semibold text-gray-800">{modalTitle}</p>

                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Icons */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-6 px-6 py-6 text-center">
                {shareLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={`w-12 h-12 flex items-center justify-center text-white rounded-full ${item.color}`}
                    >
                      {item.icon}
                    </div>

                    <span className="text-xs text-gray-600">{item.label}</span>
                  </a>
                ))}

                <button
                  onClick={copyLink}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
                    {copied ? (
                      <FiCheck className="text-green-500" />
                    ) : (
                      <FiLink />
                    )}
                  </div>

                  <span className="text-xs text-gray-600">
                    {copied ? "Copied" : "Copy Link"}
                  </span>
                </button>
              </div>

              <div className="flex justify-center pb-6">
                <button
                  onClick={shareNative}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
                    <FiMoreHorizontal size={20} />
                  </div>

                  <span className="text-xs text-gray-600">Others</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
