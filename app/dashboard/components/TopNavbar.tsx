"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiUser, FiLogOut } from "react-icons/fi";
import Link from "next/link";

export default function MobileTopbar() {
  const { data: session } = useSession();
  const [userOpen, setUserOpen] = useState(false);

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <header
      className="md:hidden sticky top-0 z-40
                       bg-white 
                       border-b border-white/10
                       flex items-center gap-3 px-4 py-3"
    >
      <div className="flex items-center gap-2 flex-1">
        <Link href="/" className="relative flex items-center h-16 w-32 md:w-64">
          <Image
            src="/images/logo/logoNew.png"
            alt="Execorner"
            fill
            priority
            className="object-contain"
          />
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => setUserOpen((prev) => !prev)}
          className="relative w-8 h-8 shrink-0"
        >
          {session?.user?.photo ? (
            <Image
              src={session.user.photo}
              alt={session.user.name ?? "User"}
              fill
              unoptimized
              className="rounded-full object-cover"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-blue-600
                            flex items-center justify-center
                            text-white text-sm font-semibold"
            >
              {userInitial}
            </div>
          )}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {userOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 top-10 w-56
                         bg-white
                         border border-black rounded-xl
                         shadow-xl overflow-hidden z-50"
            >
              <Link
                href="/profile"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-3 px-4 py-3
                           text-neutral-900 font-semibold hover:bg-white/5
                           hover:text-blue-500 transition text-sm"
              >
                <FiUser size={15} />
                Edit Profile
              </Link>

              <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-3 px-4 py-3
                           text-neutral-900 hover:text-red-500
                           transition text-sm"
              >
                <FiLogOut size={15} />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
