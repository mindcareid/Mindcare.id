import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { ArticlePerson } from "../type/article";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

type PersonCardProps = {
  role: string;
  note?: string;
  person: ArticlePerson;
};

function PersonCard({ role, note, person }: PersonCardProps) {
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-card">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-lavender-200 text-base font-semibold text-secondary">
        <span aria-hidden="true">{initialsOf(person.name)}</span>
      </span>

      <div className="min-w-0">
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-secondary">
          {role}
        </p>
        <p className="mt-1 font-heading text-lg font-semibold text-foreground">
          {person.name}
        </p>
        <p className="text-sm text-muted-foreground">{person.credentials}</p>

        {note && (
          <p className="mt-2 text-[13px] font-medium text-muted-foreground">
            {note}
          </p>
        )}

        {person.professionalSlug && (
          <Link
            href={`/professionals/${person.professionalSlug}`}
            className="group mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-brand-navy-800"
          >
            View profile
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </div>
  );
}

type ArticleAuthorsProps = {
  author: ArticlePerson;
  reviewer: ArticlePerson | null;
  reviewedAt: string | null;
};

export default function ArticleAuthors({
  author,
  reviewer,
  reviewedAt,
}: ArticleAuthorsProps) {
  return (
    <div>
      <SectionHeader title="Written and reviewed by" underline />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <PersonCard role="Author" person={author} />

        {reviewer && (
          <PersonCard
            role="Reviewer"
            note={
              reviewedAt
                ? `Reviewed ${dateFormatter.format(new Date(reviewedAt))}`
                : undefined
            }
            person={reviewer}
          />
        )}
      </div>
    </div>
  );
}
