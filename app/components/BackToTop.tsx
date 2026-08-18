"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

export default function BackToTop({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggleVisible = () => {
      if (window.scrollY > 400) setVisible(true);
      else setVisible(false);
    };
    window.addEventListener("scroll", toggleVisible);
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <motion.button
      onClick={scrollTop}
      initial={{ opacity: 0, y: 50 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <FaArrowUp />
    </motion.button>
  );
}
