"use client";

import { motion, type Variants } from "framer-motion";

const missions = [
  "Provide a platform for companies and professionals to share knowledge and real-world experience.",
  "Create meaningful opportunities for networking and collaboration between industry leaders.",
  "Deliver high-quality events, seminars, and training programs for professional growth.",
  "Empower organizations to host and manage professional events through modern technology.",
];

const values = [
  "Access for all",
  "Continuous learning",
  "Real impact",
  "Collaboration",
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const rowItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function VisionSection() {
  return (
    <section
      className="py-20 px-4 sm:px-6 border-t border-gray-200"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header row */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14"
        >
          <div>
            <span
              className="text-[12px] tracking-[3px] uppercase text-gray-400 font-semibold block mb-3"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Our foundation
            </span>
            <h2
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-gray-900 leading-tight tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Built to grow <br className="hidden sm:block" />
              professionals.
            </h2>
          </div>
          <p className="text-gray-400 text-base leading-relaxed max-w-xs">
            The principles and commitments that guide every decision we make.
          </p>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200">
          {/* Vision */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="p-8 sm:p-10 border-b md:border-b-0 md:border-r border-gray-200"
          >
            <p className="text-base tracking-[3px] uppercase text-gray-400 font-bold mb-6">
              Vision
            </p>

            <h3
              className="text-xl font-bold text-gray-900 leading-snug mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              A trusted home for professional development.
            </h3>

            <p className="text-gray-500 text-base leading-relaxed mb-8">
              We envision a future where every{" "}
              <span className="text-gray-800 font-semibold">professional</span>{" "}
              and{" "}
              <span className="text-gray-800 font-semibold">organization</span>{" "}
              has equal access to world-class training enabling{" "}
              <span className="text-gray-800 font-semibold">
                sustainable growth
              </span>{" "}
              and meaningful collaboration across industries.
            </p>

            {/* divider */}
            <div className="w-full h-px bg-gray-100 mb-6" />

            <p className="text-base tracking-[2px] uppercase text-gray-400 font-bold mb-4">
              Core values
            </p>

            <div className="flex flex-wrap gap-2">
              {values.map((v, i) => (
                <motion.span
                  key={v}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 * i, duration: 0.3 }}
                  whileHover={{
                    backgroundColor: "#111827",
                    color: "#fff",
                    borderColor: "#111827",
                  }}
                  className="border border-gray-300 px-3 py-1.5 text-[13px] md:text-[15px] rounded-2xl font-medium text-gray-600 cursor-default transition-colors duration-200"
                >
                  {v}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Mission */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="p-8 sm:p-10"
          >
            <p className="text-base tracking-[3px] uppercase text-gray-400 font-bold mb-6">
              Mission
            </p>

            <h3
              className="text-xl font-bold text-gray-900 leading-snug mb-8"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Four commitments we show up with every day.
            </h3>

            <motion.ol
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-0 border-t border-gray-200"
            >
              {missions.map((mission, idx) => (
                <motion.li
                  key={idx}
                  variants={rowItem}
                  className="flex items-start gap-4 py-4 border-b border-gray-200 group cursor-default"
                >
                  {/* Number */}
                  <span className="text-[12px] font-bold text-gray-300 group-hover:text-gray-900 transition-colors duration-200 pt-0.5 w-5 shrink-0 tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <p className="text-base text-gray-500 group-hover:text-gray-700 leading-relaxed transition-colors duration-200">
                    {mission}
                  </p>
                </motion.li>
              ))}
            </motion.ol>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
