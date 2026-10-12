"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiUser, FiLogOut } from "react-icons/fi";
import {
  MdWorkOutline,
  MdLocalHospital,
  MdOutlineEmojiObjects,
} from "react-icons/md";
import type { IconType } from "react-icons";
import { useMyListings } from "./listing/useMyListings";

export default function MobileTopbar() {
  const { data: session } = useSession();
  const [userOpen, setUserOpen] = useState(false);
  const hasListing = useMyListings();

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card md:hidden">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Link
          href="/"
          aria-label="MindCare.id, ke beranda"
          className="relative flex h-10 w-36 items-center"
        >
          <Image
            src="/images/logo/logoNew.png"
            alt="MindCare.id"
            fill
            priority
            sizes="144px"
            className="object-contain object-left"
          />
        </Link>

        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setUserOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={userOpen}
            aria-label="Menu akun"
            className="relative -mr-1 rounded-full p-1 transition-colors hover:bg-muted"
          >
            {session?.user?.photo ? (
              <span className="relative block size-9 overflow-hidden rounded-full">
                <Image
                  src={session.user.photo}
                  alt={session.user.name ?? "Pengguna"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </span>
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {userInitial}
              </span>
            )}
          </button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border border-border bg-card shadow-card-hover"
              >
                {hasListing.professional && (
                  <TopbarLink
                    href="/dashboard/professional"
                    icon={MdWorkOutline}
                    onClick={() => setUserOpen(false)}
                  >
                    My Professional Listing
                  </TopbarLink>
                )}

                {hasListing.careCentre && (
                  <TopbarLink
                    href="/dashboard/care-centre"
                    icon={MdLocalHospital}
                    onClick={() => setUserOpen(false)}
                  >
                    My Care Centre
                  </TopbarLink>
                )}

                {hasListing.solution && (
                  <TopbarLink
                    href="/dashboard/solution"
                    icon={MdOutlineEmojiObjects}
                    onClick={() => setUserOpen(false)}
                  >
                    My Solutions
                  </TopbarLink>
                )}

                <TopbarLink
                  href="/profile"
                  icon={FiUser}
                  onClick={() => setUserOpen(false)}
                >
                  Edit Profile
                </TopbarLink>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-destructive"
                >
                  <FiLogOut className="size-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function TopbarLink({
  href,
  icon: Icon,
  onClick,
  children,
}: {
  href: string;
  icon: IconType;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
    >
      <Icon size={17} />
      {children}
    </Link>
  );
}
