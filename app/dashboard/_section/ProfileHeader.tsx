import Link from "next/link";
import type { Session } from "next-auth";
import { FiBriefcase, FiPhone, FiUser, FiMail, FiEdit2 } from "react-icons/fi";
import ProfileAvatar from "../../(user)/profile/_section/ProfileAvatar";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "info";
}) {
  const toneStyles: Record<typeof tone, string> = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-brand-mint-100 text-accent",
    info: "bg-brand-lavender-100 text-secondary",
  };

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-medium ${toneStyles[tone]}`}
    >
      {label}
    </span>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="truncate text-sm font-medium text-foreground">
          {value || "-"}
        </span>
      </div>
    </div>
  );
}

export default function ProfileHeader({ user }: { user: Session["user"] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card md:p-6">
      <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center">
        <ProfileAvatar image={user.photo ?? ""} name={user.name} />

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-xl font-semibold text-foreground">
              {user.name || "-"}
            </h1>
            <Badge
              label={user.role}
              tone={user.role === "ADMIN" ? "info" : "neutral"}
            />
            {user.companyStatus && (
              <Badge
                label={user.companyStatus}
                tone={user.companyStatus === "ACTIVE" ? "success" : "neutral"}
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {user.jobTitle || "No job title available"}
            {user.jobName ? ` · ${user.jobName}` : ""}
          </p>
        </div>

        <Link
          href="/profile"
          className={buttonStyles({
            variant: "outline",
            size: "md",
            className: "shrink-0",
          })}
        >
          <FiEdit2 className="size-4" />
          Edit profile
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 pt-6 sm:grid-cols-2">
        <InfoRow
          icon={<FiMail className="size-4" />}
          label="Email"
          value={user.email}
        />
        <InfoRow
          icon={<FiPhone className="size-4" />}
          label="Phone number"
          value={user.phoneNumber}
        />
        <InfoRow
          icon={<FiBriefcase className="size-4" />}
          label="Job title"
          value={user.jobTitle}
        />
        <InfoRow
          icon={<FiUser className="size-4" />}
          label="Gender"
          value={user.gender}
        />
      </div>
    </section>
  );
}
