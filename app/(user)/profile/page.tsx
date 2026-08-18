"use client";
import { useSession } from "next-auth/react";
import ProfileHeader from "./_section/ProfileHeader";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import ProfileTabs from "./components/ProfileTab";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>Unauthorized</p>;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 my-5 sm:px-6 lg:px-8 ">
      <Link
        href={"/"}
        className="p-4 my-4 mx-auto  flex md:hidden items-center gap-4 border border-transparent "
      >
        <FaArrowLeft className="w-5 h-5" />
        <span className="text-md font-medium">My Profile </span>
      </Link>
      <p className="hidden md:block text-2xl font-medium py-4">My Profile</p>
      <ProfileHeader user={session?.user} />
      <ProfileTabs user={session?.user} />
    </section>
  );
}
