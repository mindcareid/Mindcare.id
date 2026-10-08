import { Building2, Globe, Mail, Phone, Users } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import Tag from "@/app/components/reusable/Tag";
import type { Solution } from "../type/solution";

export default function SolutionInformation({
  solution,
}: {
  solution: Solution;
}) {
  const hasContact = Boolean(solution.contactEmail || solution.contactPhone);
  const hasAnything =
    Boolean(solution.organizationName) ||
    solution.audiences.length > 0 ||
    Boolean(solution.website) ||
    hasContact;

  if (!hasAnything) return null;

  return (
    <div>
      <SectionHeader title="Listing information" underline />

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Provided by</p>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <Building2 className="size-4 text-secondary" aria-hidden="true" />
              {solution.organizationName}
            </p>
          </div>

          {solution.audiences.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Who it is for</p>
              <div className="flex flex-wrap gap-2">
                {solution.audiences.map((audience) => (
                  <Tag key={audience.id} tone="mint">
                    <Users
                      className="mr-1 inline size-3.5"
                      aria-hidden="true"
                    />
                    {audience.name}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Get in touch</p>
          <div className="flex flex-col gap-2">
            {solution.website && (
              <a
                href={solution.website}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Globe className="size-4" aria-hidden="true" />
                {solution.website}
              </a>
            )}
            {solution.contactEmail && (
              <a
                href={`mailto:${solution.contactEmail}`}
                className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary"
              >
                <Mail
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {solution.contactEmail}
              </a>
            )}
            {solution.contactPhone && (
              <span className="inline-flex items-center gap-2 text-sm text-foreground">
                <Phone
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {solution.contactPhone}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
