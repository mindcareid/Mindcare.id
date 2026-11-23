import Link from "next/link";
import Image from "next/image";
import { Users2, Building2, ArrowRight } from "lucide-react";
import Container from "@/app/components/reusable/Container";

type PillarItem = {
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  imagePositionClass?: string;
  icon: typeof Users2;
  bgClass: string;
  borderClass: string;
  iconContainerClass: string;
  buttonClass: string;
};

const PILLARS: PillarItem[] = [
  {
    title: "Professionals",
    description:
      "Connect with trusted psychologists, psychiatrists and counsellors.",
    href: "/professionals",
    imageSrc: "/images/home/banner-professionals.jpg",
    imageAlt: "Mental health professionals and counsellors",
    imagePositionClass: "object-top",
    icon: Users2,
    bgClass: "bg-[#EEF6F3] dark:bg-emerald-950/20",
    borderClass: "border-[#D0E7DC] dark:border-emerald-900/40",
    iconContainerClass:
      "border-emerald-300/80 bg-white/90 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    buttonClass: "bg-[#1F4E3D] text-white hover:bg-[#16382C]",
  },
  {
    title: "Care Centres",
    description:
      "Discover care centres and clinics that support your well-being.",
    href: "/care-centres",
    imageSrc: "/images/home/banner-care-centres.jpg",
    imageAlt: "Care centres and clinics room",
    imagePositionClass: "object-center",
    icon: Building2,
    bgClass: "bg-[#F0F5FA] dark:bg-blue-950/20",
    borderClass: "border-[#D2E2F0] dark:border-blue-900/40",
    iconContainerClass:
      "border-blue-300/80 bg-white/90 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    buttonClass: "bg-[#275887] text-white hover:bg-[#1B3E60]",
  },
];

export default function PillarBanner() {
  return (
    <Container
      as="section"
      aria-label="Layanan Utama"
      className="pb-4 pt-8 sm:pb-6 sm:pt-10"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <Link
              key={pillar.title}
              href={pillar.href}
              className={`group flex min-h-44 overflow-hidden rounded-2xl border ${pillar.borderClass} ${pillar.bgClass} shadow-card transition-all duration-300 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
            >
              {/* Kolom Teks & Aksi */}
              <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                <div>
                  <div
                    className={`inline-flex size-9 items-center justify-center rounded-full border ${pillar.iconContainerClass}`}
                  >
                    <Icon className="size-4.5" aria-hidden="true" />
                  </div>

                  <h3 className="mt-3 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {pillar.title}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-4">
                  <span
                    className={`inline-flex size-9 items-center justify-center rounded-full shadow-xs transition-transform duration-200 group-hover:translate-x-1 sm:size-10 ${pillar.buttonClass}`}
                    aria-hidden="true"
                  >
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </div>

              {/* Kolom Foto */}
              <div className="relative w-36 shrink-0 overflow-hidden sm:w-44 md:w-40 lg:w-48">
                <Image
                  src={pillar.imageSrc}
                  alt={pillar.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 240px, (min-width: 768px) 200px, 160px"
                  className={`object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
                    pillar.imagePositionClass ?? "object-center"
                  }`}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
