"use client";

import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiUsers, FiAward, FiTrendingUp } from "react-icons/fi";
import { useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { IoImageOutline, IoCloseOutline } from "react-icons/io5";
import { MdFullscreenExit, MdFullscreen } from "react-icons/md";
import CountUp from "../components/CountUp";

const stats = [
  { icon: <FiUsers />, value: 10000, suffix: "", label: "Professionals" },
  { icon: <FiAward />, value: 500, suffix: "", label: "Events" },
  { icon: <FiTrendingUp />, value: 100, suffix: "", label: "Experts" },
];

const features = [
  "Professional Conferences & Seminars",
  "Executive Networking Opportunities",
  "Industry Insights & Knowledge Sharing",
  "Collaboration Between Companies & Professionals",
];

export default function AboutSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const [photoOpen, setPhotoOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Parallax hanya aktif di desktop — di mobile tidak terasa dan hanya membuang resource
  const imgY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-20 sm:py-24 overflow-hidden bg-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* ==================== LEFT: Image + Stats ==================== */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Image frame */}
            <motion.div
              // Parallax hanya jalan di lg ke atas lewat CSS — tidak bisa disable di framer
              // tapi efeknya subtle jadi tidak masalah di mobile
              style={{ y: imgY }}
              className="relative cursor-pointer group"
              onClick={() => setPhotoOpen(true)}
            >
              <Image
                src="/images/HRDI.jpg"
                alt="Execorner"
                width={600}
                height={400}
                className="object-cover w-full rounded-2xl shadow-lg"
                priority
              />

              {/* Trusted badge */}
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="absolute bottom-3 right-3 text-white text-xs font-semibold flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20"
              >
                <IoImageOutline className="w-4 h-4" />
                See photos
              </motion.span>
            </motion.div>

            {/* Stats row — label diperpendek supaya muat di 3 kolom */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-gray-200 mt-4 py-4 gap-4 overflow-hidden">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center gap-2"
                >
                  <div className="text-blue-400 text-2xl">{stat.icon}</div>
                  <div className="text-3xl font-bold flex items-baseline">
                    <CountUp
                      to={stat.value}
                      from={0}
                      separator=","
                      duration={1.5}
                      delay={0.2 + i * 0.1}
                      className="tabular-nums"
                    />
                    {stat.suffix}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ==================== RIGHT: Text ==================== */}
          <motion.div
            // pl hanya aktif di lg — di mobile tidak ada indent
            className="lg:col-span-7 lg:pl-10 pt-0 lg:pt-2"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-5">
              <span className="w-7 h-px bg-gray-900" />
              <span className="text-[10px] tracking-[3px] uppercase text-gray-500 font-medium">
                About Execorner
              </span>
            </div>

            {/* Headline — font size lebih kecil di mobile */}
            <h2 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Connecting
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">Professionals</span>
                {/* Underline highlight */}
                <motion.span
                  className="absolute bottom-1 left-0 right-0 h-2.5 bg-gray-100 -z-10"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
                  style={{ transformOrigin: "left" }}
                />
              </span>
              <br />
              &amp; Industry Leaders
            </h2>

            {/* Body text */}
            <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-lg">
              Execorner is a platform designed to bring together professionals,
              business leaders, and industry experts in a space that fosters
              knowledge sharing, collaboration, and meaningful connections.
              Through seminars, conferences, and networking sessions, we create
              opportunities for individuals and organizations to learn, grow,
              and build valuable relationships.
            </p>

            {/* Feature list */}
            <ul className="mb-8 border-t border-gray-200">
              {features.map((f, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 * i, duration: 0.35 }}
                  className="flex items-center justify-between py-3 border-b border-gray-200 group cursor-default"
                >
                  <span className="text-base text-gray-700 group-hover:text-gray-900 transition-colors  cursor-pointer font-medium pr-4">
                    {f}
                  </span>
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-300 group-hover:border-gray-900 group-hover:bg-gray-900 transition-all duration-200 shrink-0" />
                </motion.li>
              ))}
            </ul>

            <Link
              href="/events"
              className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors duration-200"
            >
              Join Our Events
              <FaArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {photoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/90  z-9999 flex items-center justify-center"
            onClick={() => setPhotoOpen(false)}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullScreen((p) => !p);
                }}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20  p-2 rounded-lg transition"
              >
                {isFullScreen ? (
                  <MdFullscreenExit className="w-5 h-5" />
                ) : (
                  <MdFullscreen className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => {
                  setPhotoOpen(false);
                  setIsFullScreen(false);
                }}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20  p-2 rounded-lg transition"
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
                isFullScreen ? "w-full h-screen p-0" : "max-w-4xl w-full mx-4"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={"/images/HRDI.jpg"}
                alt="ExeCorner Logo Forum"
                width={1920}
                height={1080}
                unoptimized
                className={`shadow-2xl object-contain transition-all duration-300 ${
                  isFullScreen
                    ? "w-full h-screen rounded-none"
                    : "w-full h-auto rounded-2xl"
                }`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
