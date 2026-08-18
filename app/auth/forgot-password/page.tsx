"use client";

import { motion } from "framer-motion";
import ForgotPasswordForm from "@/app/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br bg-slate-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
            <motion.div
              animate={{
                rotate: [0, -4, 4, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut",
              }}
              className="text-6xl"
            >
              🔒
            </motion.div>
            <motion.div
              initial={{ x: 40, opacity: 0, rotate: 0 }}
              animate={{
                x: [20, 10, 15],
                opacity: [0, 1, 1],
                rotate: [0, 30, 45],
              }}
              transition={{
                delay: 0.8,
                duration: 1.8,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="absolute text-3xl mt-4"
            >
              🗝️
            </motion.div>
          </div>
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Forgot your password?
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Don’t worry, we’ll help you reset it
            </p>
          </div>
          <ForgotPasswordForm />
          <div className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <a
              href="/auth/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Back to login
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
