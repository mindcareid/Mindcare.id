"use client";

import { useEffect, useState } from "react";
import {
  faUsers,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { name: "Total Users", value: 0, icon: faUsers, color: "bg-blue-100 text-blue-700", link: "/cadmin/user" },
    { name: "Total Events", value: 0, icon: faBriefcase, color: "bg-green-100 text-green-700", link: "/cadmin/events" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        if (res.ok) {
          setStats([
            { name: "Total Users", value: data.users, icon: faUsers, color: "bg-blue-100 text-blue-700", link: "/cadmin/user" },
            { name: "Total Events", value: data.events, icon: faBriefcase, color: "bg-green-100 text-green-700", link: "/cadmin/events" },
          ]);
        }
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Link href={stat.link} key={idx}> <div
            key={idx}
            className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4 hover:shadow-lg transition"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}
            >
              <FontAwesomeIcon icon={stat.icon} className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.name}</p>
              <h2 className="text-xl font-semibold text-gray-800">
                {stat.value}
              </h2>
            </div>
          </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
