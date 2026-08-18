"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, cubicBezier } from "framer-motion";
import { FaHourglassStart, FaHourglassEnd } from "react-icons/fa";
import { MdMarkEmailRead, MdRateReview } from "react-icons/md";
import { IconType } from "react-icons";
import { GiConfirmed } from "react-icons/gi";

type infoType = {
  text: string;
  icon: IconType;
};
export default function CompanyPendingPage() {
  const { update } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const easeCustom = cubicBezier(0.22, 1, 0.36, 1);
  const [refId] = useState(
    () =>
      `REG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const refreshStatus = async () => {
      const updated = await update();
      const status = updated?.user?.companyStatus;

      if (status === "ACTIVE") {
        router.replace("/company/dashboard");
      } else if (!status || status === "DECLINED") {
        router.replace("/company/create");
      }
    };
    const interval = setInterval(refreshStatus, 40_000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: easeCustom },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: easeCustom },
    },
  };

  const progressVariants = {
    hidden: { width: "0%" },
    visible: {
      width: "50%",
      transition: { duration: 1.2, ease: easeCustom, delay: 0.8 },
    },
  };

  const steps = [
    { id: 1, label: "Submitted", status: "done" },
    { id: 2, label: "Under Review", status: "active" },
    { id: 3, label: "Decision", status: "pending" },
  ] as const;

  const infoItems: infoType[] = [
    {
      icon: MdMarkEmailRead,
      text: "You'll be notified via email and notification once the review is complete.",
    },
    {
      icon: MdRateReview,
      text: "Reviews typically take 1–3 business days.",
    },
    {
      icon: GiConfirmed,
      text: "Ensure your submitted documents are complete and accurate.",
    },
  ];

  function PulsingOrb() {
    const [flipped, setFlipped] = useState(false);
    useEffect(() => {
      const interval = setInterval(() => {
        setFlipped((prev) => !prev);
      }, 1500);
      return () => clearInterval(interval);
    }, []);
    return (
      <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-blue-400"
            animate={{ scale: [1, 1.6 + i * 0.2], opacity: [0.35, 0] }}
            transition={{
              duration: 2 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.45,
              ease: "easeOut",
            }}
          />
        ))}

        <div className="relative z-10 w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-blue-400 flex items-center justify-center shadow-[0_8px_32px_rgba(59,130,246,0.45)] overflow-hidden">
          <AnimatePresence mode="wait">
            {flipped ? (
              <motion.div
                key="end"
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <FaHourglassEnd size={26} color="white" />
              </motion.div>
            ) : (
              <motion.div
                key="start"
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <FaHourglassStart size={26} color="white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  function StepTracker() {
    return (
      <motion.div variants={itemVariants} className="relative mb-8">
        <div className="absolute top-4.5 left-[16.66%] right-[16.66%] h-0.5 bg-blue-100 rounded-full" />

        <motion.div
          variants={progressVariants}
          initial="hidden"
          animate="visible"
          className="absolute top-4.5 left-[16.66%] h-0.5 bg-linear-to-r from-blue-500 to-blue-400 rounded-full"
        />

        <div className="relative flex justify-between">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.6 + i * 0.15,
                  ease: "easeOut",
                }}
                className={[
                  "relative z-10 w-9 h-9 rounded-full flex items-center justify-center",
                  step.status === "done"
                    ? "bg-linear-to-br from-blue-500 to-blue-400 shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
                    : step.status === "active"
                      ? "bg-white border-[2.5px] border-blue-500"
                      : "bg-blue-50 border-2 border-blue-100",
                ].join(" ")}
              >
                {step.status === "done" ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8l3.5 3.5L13 5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : step.status === "active" ? (
                  <motion.div
                    animate={{ scale: [1, 0.6, 1], opacity: [1, 0.4, 1] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-2.5 h-2.5 rounded-full bg-blue-500"
                  />
                ) : (
                  <span className="text-[13px] font-semibold text-blue-200">
                    {step.id}
                  </span>
                )}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.15 }}
                className={[
                  "text-[11.5px] font-semibold tracking-wide",
                  step.status !== "pending" ? "text-blue-600" : "text-blue-200",
                ].join(" ")}
              >
                {step.label}
              </motion.p>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  function InfoCard({
    icon: Icon,
    text,
  }: {
    icon: IconType;
    text: string;
    index: number;
  }) {
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ x: 4, transition: { duration: 0.2 } }}
        className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50/70 border border-blue-100 mb-2.5 cursor-default select-none"
      >
        <span className="text-base text-blue-400 self-center mt-0.5 shrink-0">
          <Icon />
        </span>
        <p className="text-[13px] text-blue-700/80 leading-relaxed">{text}</p>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <motion.div
        animate={{
          x: [0, 20, 0],
          y: [0, -15, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-28 -left-28 w-100 h-100 rounded-full bg-blue-100/40 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -15, 0],
          y: [0, 15, 0],
          scale: [1, 0.97, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute -bottom-24 -right-24 w-90 h-90 rounded-full bg-indigo-100/40 blur-3xl pointer-events-none"
      />

      <AnimatePresence>
        {mounted && (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="relative w-full max-w-md"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.1,
              }}
              className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-blue-400 to-indigo-400 rounded-t-2xl origin-left"
            />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_48px_rgba(59,130,246,0.12),0_2px_12px_rgba(0,0,0,0.05)] border border-white/70 px-8 py-10"
            >
              <motion.div variants={itemVariants}>
                <PulsingOrb />
              </motion.div>

              <motion.div variants={itemVariants} className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                  Under Review
                </h1>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Your company registration is being carefully reviewed by our
                  team. We'll notify you once a decision is made.
                </p>
              </motion.div>

              <StepTracker />

              <motion.div variants={containerVariants}>
                {infoItems.map((item, i) => (
                  <InfoCard
                    key={i}
                    index={i}
                    icon={item.icon}
                    text={item.text}
                  />
                ))}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex flex-col md:flex-row gap-3 mt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1"
                >
                  <Link
                    href={"/#contact"}
                    className="flex items-center justify-center w-full px-5 py-3 rounded-xl border border-blue-100 text-blue-600 text-sm font-semibold bg-blue-50/60 hover:bg-blue-50 transition-colors"
                  >
                    Contact Support
                  </Link>
                </motion.button>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1"
                >
                  <Link
                    href="/"
                    className="flex items-center justify-center w-full px-5 py-3 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-[0_4px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_24px_rgba(59,130,246,0.45)] transition-shadow"
                  >
                    Back to Home
                  </Link>
                </motion.div>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-center text-xs text-gray-300 mt-5 font-mono tracking-wider"
              >
                {refId}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
