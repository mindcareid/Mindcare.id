import { cn } from "@/lib/utils";
import Container from "./Container";
import { Blob, LeafOrnament } from "./Ornaments";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  media?: React.ReactNode;
  children?: React.ReactNode;
  ornament?: React.ReactNode | false;
  className?: string;
  contentClassName?: string;
};

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  media,
  children,
  ornament,
  className,
  contentClassName,
}: PageHeroProps) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      {ornament === false ? null : (
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          {ornament ?? (
            <>
              <Blob
                tone="lavender"
                className="absolute -left-24 -top-24 size-72 opacity-70"
              />
              <Blob
                tone="mint"
                className="absolute -right-16 top-32 size-64 opacity-60"
              />
              <LeafOrnament className="absolute right-6 top-0 hidden h-56 lg:block" />
            </>
          )}
        </div>
      )}

      <Container className="py-14 md:py-20">
        <div
          className={cn(
            "grid items-center gap-10",
            media && "lg:grid-cols-2 lg:gap-14",
          )}
        >
          <div className={cn(!media && "max-w-3xl", contentClassName)}>
            {eyebrow && (
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
                {eyebrow}
              </p>
            )}

            <h1
              className={cn(
                "font-heading font-semibold text-foreground",
                "text-[34px] leading-[1.05] tracking-[-0.01em] md:text-[44px] lg:text-[68px]",
                eyebrow && "mt-3",
              )}
            >
              {title}
            </h1>

            {subtitle && (
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            )}

            {children && <div className="mt-8">{children}</div>}
          </div>

          {media && <div className="relative">{media}</div>}
        </div>
      </Container>
    </section>
  );
}
