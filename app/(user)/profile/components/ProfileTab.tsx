"use client";

import { useState } from "react";
import PersonalInformation from "../_section/PersonalInformation";
import ChangePassword from "../_section/PasswordChange";

const tabs = [
  { key: "profile", label: "Profile" },
  { key: "password", label: "Change password" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function ProfileTabs({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const tabContent: Record<TabKey, React.ReactNode> = {
    profile: <PersonalInformation user={user} />,
    password: <ChangePassword />,
  };

  return (
    <>
      <div className="flex gap-6 border-b border-border mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium transition ${
              activeTab === tab.key
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">{tabContent[activeTab]}</div>
    </>
  );
}
