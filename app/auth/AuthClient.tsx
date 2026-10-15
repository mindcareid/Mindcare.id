"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import AuthTabs from "./component/AuthTabs";
import type { LoginFormData } from "@/lib/validations/auth";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl = rawCallbackUrl || "/events";
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<"login" | "register">(
    tabParam === "register" ? "register" : "login",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(0);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.ok) {
        toast.success("Login successful!");

        setTimeout(() => {
          window.location.assign(callbackUrl);
        }, 500);
        return;
      }

      if (res?.error) {
        toast.error(res.error || "Login failed");
        return;
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-brand-lavender-100 via-background to-brand-mint-100 px-4 py-12">
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-brand-purple-600/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-brand-emerald-600/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-3xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-card p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-lavender-100">
              {tab === "login" ? (
                <svg
                  className="w-7 h-7 text-brand-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-7 h-7 text-brand-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                  />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {tab === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === "login"
                ? "Good to see you again."
                : "Start your journey with us."}
            </p>
          </div>

          <AuthTabs
            tab={tab}
            setTab={(v) => {
              setDirection(v === "login" ? -1 : 1);
              setTab(v);
              const params = new URLSearchParams({ tab: v });
              if (rawCallbackUrl) {
                params.set("callbackUrl", rawCallbackUrl);
              }
              router.replace(`/auth?${params.toString()}`);
            }}
          />

          <div className="relative min-h-88">
            <AnimatePresence mode="popLayout">
              {tab === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: direction * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: direction * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <RegisterForm callbackUrl={rawCallbackUrl} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
