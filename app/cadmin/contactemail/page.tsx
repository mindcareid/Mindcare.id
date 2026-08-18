"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/FormatDate";

type Contact = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  subject: string;
  message: string;
  status: "UNREAD" | "READ" | "REPLIED";
  createdAt: string;
  repliedAt: string | null;
};

const statusBadge = {
  UNREAD: "bg-red-100 text-red-600",
  READ: "bg-yellow-100 text-yellow-700",
  REPLIED: "bg-green-100 text-green-700",
};

export default function ContactEmailAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ" | "REPLIED">(
    "ALL",
  );

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      const url =
        filter === "ALL"
          ? "/api/cadmin/contacts"
          : `/api/cadmin/contacts?status=${filter}`;
      const res = await fetch(url);
      const json = await res.json();
      setContacts(json.data ?? []);
      setLoading(false);
    };
    fetch_();
  }, [filter]);

  const unreadCount = contacts.filter((c) => c.status === "UNREAD").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage incoming messages from the contact form
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["ALL", "UNREAD", "READ", "REPLIED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No messages found
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <Link
              key={contact.id}
              href={`/cadmin/contactemail/${contact.id}`}
              className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition group"
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* Dot unread */}
                <div className="mt-1.5 shrink-0">
                  {contact.status === "UNREAD" ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-200 block" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`font-semibold text-gray-900 ${contact.status === "UNREAD" ? "font-bold" : ""}`}
                    >
                      {contact.name}
                    </p>
                    <span className="text-xs text-gray-400">
                      {contact.email}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-0.5">
                    {contact.subject}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(contact.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge[contact.status]}`}
                >
                  {contact.status}
                </span>
                <span className="text-gray-400 group-hover:text-gray-600 transition text-sm">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
