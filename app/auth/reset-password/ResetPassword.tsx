"use client";

import ResetPasswordForm from "@/app/components/auth/ResetPasswordForm";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ResetPassword() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br bg-slate-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="rounded-3xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.8,
              type: "spring",
              stiffness: 200,
            }}
            className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut",
              }}
              className="text-6xl"
            >
              🔑
            </motion.div>
            <motion.div
              initial={{ scale: 0, x: -20 }}
              animate={{
                scale: [0, 1, 0],
                x: [-20, -30, -35],
                y: [-10, -20, -25],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                repeatDelay: 0.5,
              }}
              className="absolute text-xl"
            >
              🔐
            </motion.div>
            <motion.div
              initial={{ scale: 0, x: 20 }}
              animate={{
                scale: [0, 1, 0],
                x: [20, 30, 35],
                y: [-10, -15, -20],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                repeatDelay: 0.8,
                delay: 0.3,
              }}
              className="absolute text-xl"
            >
              ✨
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Reset your password
            </h1>
            <p className="text-sm text-gray-600">
              Enter your email to receive a password reset link
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <ResetPasswordForm />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 text-center text-sm text-gray-600"
          >
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Login
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
