"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import ProfileHeader from "./_section/ProfileHeader";
import ProfileTabs from "./components/ProfileTab";
import SessionExpired from "@/app/components/reusable/SessionExpired";
import type { User } from "@/types/auth";

function ProfileSkeleton() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading your profile</span>
      <div className="h-7 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-5 h-44 animate-pulse rounded-xl border border-border bg-muted" />
      <div className="mt-5 h-28 animate-pulse rounded-xl border border-border bg-muted" />
    </section>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <ProfileSkeleton />;
  }

  if (status === "unauthenticated") {
    return <SessionExpired callbackUrl="/profile" />;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 my-5 sm:px-6 lg:px-8">
      <Link href="/" className="my-4 flex items-center gap-4 p-4 md:hidden">
        <FaArrowLeft className="size-5" />
        <span className="text-base font-medium">My Profile</span>
      </Link>
      <p className="hidden py-4 text-2xl font-medium md:block">My Profile</p>
      <ProfileHeader user={session?.user} />
      <ProfileTabs user={session?.user as User} />
    </section>
  );
}
