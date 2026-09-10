import { FiBriefcase, FiPhone, FiUser, FiMail } from "react-icons/fi";
import ProfileAvatar from "../../(user)/profile/_section/ProfileAvatar";
import { Session } from "next-auth";
import Link from "next/link";
import { FiEdit2 } from "react-icons/fi";

function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "info";
}) {
  const toneStyles: Record<typeof tone, string> = {
    neutral: "bg-gray-100 text-gray-600",
    success: "bg-emerald-50 text-emerald-700",
    info: "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${toneStyles[tone]}`}
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
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 text-gray-500 shrink-0">
        {icon}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-800">
          {value || "-"}
        </span>
      </div>
    </div>
  );
}

export default function ProfileHeader({ user }: { user: Session["user"] }) {
  return (
    <div className="mx-4 mt-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-gray-100">
          <ProfileAvatar image={user.photo ?? ""} name={user.name} />

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold text-gray-900">
                {user.name || "-"}
              </h2>
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
            <p className="text-sm text-gray-500">
              {user.jobTitle || "No job title available"}
              {user.jobName ? ` · ${user.jobName}` : ""}
            </p>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-500 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shrink-0"
          >
            <FiEdit2 className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 pt-6">
          <InfoRow
            icon={<FiMail className="w-4 h-4" />}
            label="Email"
            value={user.email}
          />
          <InfoRow
            icon={<FiPhone className="w-4 h-4" />}
            label="Phone Number"
            value={user.phoneNumber}
          />
          <InfoRow
            icon={<FiBriefcase className="w-4 h-4" />}
            label="Job Title"
            value={user.jobTitle}
          />
          <InfoRow
            icon={<FiUser className="w-4 h-4" />}
            label="Gender"
            value={user.gender}
          />
        </div>
      </div>
    </div>
  );
}
