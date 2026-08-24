"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FooterMenu } from "../data/menu";

export default function Footer() {
  const { data: session } = useSession();
  return (
    <footer className="bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      <div className=" mx-auto px-6 md:px-10 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-7 gap-12 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="md:col-span-2 flex flex-col gap-5"
          >
            <Link href="/" className="relative h-20 w-48">
              <Image
                src="/images/logo/logoNew.png"
                alt="Execorner"
                fill
                unoptimized
                className="object-contain"
              />
            </Link>
            <p className="max-w-lg text-base leading-relaxed text-neutral-950">
              MindCare Indonesia will be the nation’s premier Mental Health and
              Wellness Exhibition and Conference, focusing on mental well-being,
              holistic healing, and innovative approaches to mental health care.
              This groundbreaking event aims to bring together professionals,
              thought leaders, and advocates from across Indonesia and beyond to
              share insights, solutions, and tools for mental health management
              and personal wellness.
            </p>
          </motion.div>

          {FooterMenu.map((foot) => (
            <div key={foot.title}>
              <h4 className="text-base font-semibold tracking-widest md:tracking-normal uppercase text-neutral-900 mb-5">
                {foot.title}
              </h4>

              {foot.items && (
                <ul className="space-y-3">
                  {foot.items.map((item) => {
                    const href =
                      item.isAuthRedirect && session?.user
                        ? "/company/create"
                        : item.path;

                    return (
                      <li key={item.path}>
                        <Link
                          href={href}
                          className="text-base font-semibold text-neutral-950 hover:text-blue-500 transition-colors duration-200"
                        >
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              {foot.social && (
                <div className="flex gap-4">
                  {foot.social.map((social, index) => {
                    const Icon = social.icon;

                    return (
                      <a
                        key={index}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon size={32} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-4 pt-8 flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between text-base text-neutral-900">
          <p>© {new Date().getFullYear()} Mindcare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
