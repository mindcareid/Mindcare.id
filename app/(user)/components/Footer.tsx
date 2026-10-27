"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FooterMenu } from "../data/menu";
import Container from "@/app/components/reusable/Container";

export default function Footer() {
  const { data: session } = useSession();
  const linkGroups = FooterMenu.filter((group) => group.items);
  const socialGroup = FooterMenu.find((group) => group.social);

  return (
    <footer className="border-t border-border bg-card">
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-12">
          <div className="col-span-2 flex flex-col gap-5 sm:col-span-3 lg:col-span-4">
            <Link
              href="/"
              aria-label="MindCare.id, ke beranda"
              className="relative h-12 w-40"
            >
              <Image
                src="/images/logo/logoNew.png"
                alt="MindCare.id"
                fill
                unoptimized
                sizes="160px"
                className="object-contain object-left"
              />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              MindCare.id is a directory for mental-health support in Indonesia.
              It brings together professionals, care centres, and structured
              solutions, plus the events and articles that come from the people
              listed here. Every listing is reviewed before it goes live.
            </p>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title} className="lg:col-span-2">
              <h2 className="text-sm font-semibold text-foreground">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {group.items?.map((item) => {
                  const href =
                    item.isAuthRedirect && session?.user
                      ? "/apply"
                      : item.path;

                  return (
                    <li key={item.path}>
                      <Link
                        href={href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MindCare.id. All rights reserved.
          </p>

          {socialGroup?.social && (
            <ul className="flex items-center gap-2">
              {socialGroup.social.map((social) => {
                const Icon = social.icon;
                return (
                  <li key={social.link}>
                    <a
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="MindCare.id di media sosial"
                      className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Container>
    </footer>
  );
}
