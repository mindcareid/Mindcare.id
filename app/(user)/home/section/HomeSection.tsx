import Container from "@/app/components/reusable/Container";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import { cn } from "@/lib/utils";

type HomeSectionProps = {
  title: string;
  description?: string;
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function HomeSection({
  title,
  description,
  href,
  children,
  className,
}: HomeSectionProps) {
  return (
    <Container as="section" className={cn("py-12 md:py-16", className)}>
      <SectionHeader title={title} description={description} href={href} />
      <div className="mt-8">{children}</div>
    </Container>
  );
}
