import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import HeroList from "./components/HeroList";

export default function HeroPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Hero slides
          </h1>
          <p className="text-sm text-muted-foreground">
            Images for the homepage slideshow, shown in the order you set. Until
            at least one slide is active, the homepage keeps its default hero.
          </p>
        </div>
        <Link
          href="/cadmin/hero/create"
          className={buttonStyles({ size: "md" })}
        >
          <Plus className="h-4 w-4" />
          Add slide
        </Link>
      </div>

      <HeroList />
    </div>
  );
}
