"use client";

import { motion } from "framer-motion";

type Props = {
  tab: "login" | "register";
  setTab: (v: "login" | "register") => void;
};

export default function AuthTabs({ tab, setTab }: Props) {
  return (
    <div className="relative flex bg-gray-100/80 backdrop-blur-md rounded-2xl p-1.5 mb-6 border border-gray-200">
      <motion.div
        layoutId="tab-indicator"
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl bg-white shadow-sm border border-gray-200"
        style={{
          left: tab === "login" ? "6px" : "calc(50%)",
        }}
      />
      <button
        onClick={() => setTab("login")}
        className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
          ${tab === "login" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}
        `}
      >
        Sign in
      </button>
      <button
        onClick={() => setTab("register")}
        className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
          ${tab === "register" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}
        `}
      >
        Create account
      </button>
    </div>
  );
}
