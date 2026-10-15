"use client";

import { motion } from "framer-motion";

type Props = {
  tab: "login" | "register";
  setTab: (v: "login" | "register") => void;
};

export default function AuthTabs({ tab, setTab }: Props) {
  return (
    <div className="relative flex bg-muted rounded-2xl p-1 mb-6 border border-border">
      <motion.div
        layoutId="tab-indicator"
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-card shadow-sm border border-border"
        style={{
          left: tab === "login" ? "4px" : "calc(50%)",
        }}
      />
      <button
        onClick={() => setTab("login")}
        className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
          ${tab === "login" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
        `}
      >
        Sign in
      </button>
      <button
        onClick={() => setTab("register")}
        className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
          ${tab === "register" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
        `}
      >
        Create account
      </button>
    </div>
  );
}
