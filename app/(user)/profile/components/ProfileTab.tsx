"use client";

import { useState } from "react";
import PersonalInformation from "../_section/PersonalInformation";
import ChangePassword from "../_section/PasswordChange";
import type { User } from "@/types/auth";

const tabs = [
  { key: "profile", label: "Profile" },
  { key: "password", label: "Change password" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function ProfileTabs({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const tabContent: Record<TabKey, React.ReactNode> = {
    profile: <PersonalInformation user={user} />,
    password: <ChangePassword />,
  };

  return (
    <>
      <div
        role="tablist"
        aria-label="Profile settings"
        className="mt-6 flex gap-6 border-b border-border"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">{tabContent[activeTab]}</div>
    </>
  );
}
