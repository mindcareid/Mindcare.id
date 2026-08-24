import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar } from "lucide-react";
import { cn, dateFormatter, initialsOf } from "@/lib/utils";
import Tag from "./Tag";
export type ArticlePerson = {
  name: string;
  role: string;
  avatarUrl?: string | null;
};

type ArticleCardProps = {
  href: string;
  title: string;
  excerpt?: string;
  category?: string;
  imageUrl?: string | null;
  author: ArticlePerson;
  reviewer?: ArticlePerson;
  reviewedAt?: string;
  readTimeMinutes: number;
  className?: string;
};

export default function ArticleCard({
  href,
  title,
  excerpt,
  category,
  imageUrl,
  author,
  reviewedAt,
  readTimeMinutes,
  className,
}: ArticleCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        "shadow-card transition-shadow duration-300 hover:shadow-card-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="relative h-48 w-full overflow-hidden bg-brand-mint-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="block size-full bg-linear-to-br from-brand-mint-200 to-brand-lavender-200"
          />
        )}
        {category && (
          <div className="absolute left-3 top-3">
            <Tag>{category}</Tag>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-heading text-[22px] font-semibold leading-snug text-foreground">
          {title}
        </h3>

        {excerpt && (
          <p className="line-clamp-2 text-base text-muted-foreground">
            {excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 border-t border-border pt-4">
          <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-brand-lavender-200">
            {author.avatarUrl ? (
              <Image
                src={author.avatarUrl}
                alt={author.name}
                fill
                sizes="36px"
                className="object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-full items-center justify-center text-[13px] font-semibold text-secondary"
              >
                {initialsOf(author.name)}
              </span>
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {author.name}
            </p>
            <p className="truncate text-[13px] text-muted-foreground">
              {author.role}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-muted-foreground">
          {reviewedAt && (
            <>
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5" aria-hidden="true" />
                Reviewed {dateFormatter.format(new Date(reviewedAt))}
              </span>
              <span aria-hidden="true" className="text-border">
                &middot;
              </span>
            </>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {readTimeMinutes} min read
          </span>
        </div>
      </div>
    </Link>
  );
}
