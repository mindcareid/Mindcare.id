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
  const callbackUrl = searchParams.get("callbackUrl") || "/events";
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
          router.replace(callbackUrl);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {tab === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-gray-600">
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
              router.replace(`/auth?tab=${v}`);
            }}
          />

          <div className="relative min-h-80">
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
                  <RegisterForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
