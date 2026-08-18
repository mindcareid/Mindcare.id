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
      <div className="flex gap-6 border-b border-gray-200 mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium transition ${
              activeTab === tab.key
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
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
