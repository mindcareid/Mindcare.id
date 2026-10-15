"use client";

import ResetPasswordForm from "@/app/components/auth/ResetPasswordForm";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ResetPassword() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-brand-lavender-100 via-background to-brand-mint-100 px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-brand-purple-600/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-brand-emerald-600/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="rounded-3xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-card p-6 sm:p-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-lavender-100">
            <svg className="w-8 h-8 text-brand-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.558.425l-4.587 4.587a1.125 1.125 0 01-.795.318h-2.043l-1.5 1.5v-2.043c0-.298.119-.585.33-.795l4.587-4.587a1.125 1.125 0 00.425-1.558A6 6 0 0118.75 5.25z" />
            </svg>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your new password below
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ResetPasswordForm />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-brand-purple-600 hover:text-brand-purple-700 transition-colors"
            >
              Login
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
