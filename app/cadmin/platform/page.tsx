import prisma from "@/lib/prisma";
import { PLATFORM_SLUG } from "@/lib/events/constants";
import PlatformForm from "./PlatformForm";

export default async function PlatformPage() {
  const platform = await prisma.platform.findUnique({
    where: { slug: PLATFORM_SLUG },
  });

  if (!platform) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-card">
          Platform account is not configured.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <PlatformForm
        id={platform.id}
        name={platform.name}
        slug={platform.slug}
      />
    </div>
  );
}
