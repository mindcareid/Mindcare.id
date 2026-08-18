"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils/FormatDate";
import Link from "next/link";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineMail,
  MdOutlineLocalPhone,
} from "react-icons/md";
import { toast } from "sonner";

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

export default function ContactDetailAdmin() {
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cadmin/contacts/${id}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setContact(json.data);
      } catch {
        toast.error("Failed to load message");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchContact();
  }, [id]);

  const handleMarkReplied = async () => {
    setMarking(true);
    try {
      const res = await fetch(`/api/cadmin/contacts/${id}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error();
      setContact((prev) =>
        prev
          ? { ...prev, status: "REPLIED", repliedAt: new Date().toISOString() }
          : prev,
      );
      toast.success("Marked as replied!");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setMarking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/cadmin/contacts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Message deleted");
      router.push("/cadmin/contactemail");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="h-6 w-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-400">
        Message not found.{" "}
        <Link
          href="/cadmin/contactemail"
          className="text-blue-600 hover:underline"
        >
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back */}
      <Link
        href="/cadmin/contactemail"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition"
      >
        <MdOutlineKeyboardArrowLeft className="w-5 h-5" />
        Back to Messages
      </Link>

      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {contact.name}
              </h1>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  statusBadge[contact.status]
                }`}
              >
                {contact.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(contact.createdAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {contact.status !== "REPLIED" && (
              <button
                onClick={handleMarkReplied}
                disabled={marking}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-60"
              >
                {marking ? "Updating..." : "✓ Mark as Replied"}
              </button>
            )}

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Email */}
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition group"
          >
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition">
              <MdOutlineMail className="w-5 h-5 text-blue-600 group-hover:text-white transition" />
            </div>

            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900">
                {contact.email}
              </p>
            </div>
          </a>

          {/* Phone */}
          {contact.phoneNumber && (
            <a
              href={`tel:${contact.phoneNumber}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition group"
            >
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition">
                <MdOutlineLocalPhone className="w-5 h-5 text-blue-600 group-hover:text-white transition" />
              </div>

              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900">
                  {contact.phoneNumber}
                </p>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
            Subject
          </p>
          <p className="font-semibold text-gray-900">{contact.subject}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
            Message
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {contact.message}
          </div>
        </div>
      </div>

      {/* Replied info */}
      {contact.status === "REPLIED" && contact.repliedAt && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          <span>✓</span>
          <span>Marked as replied on {formatDate(contact.repliedAt)}</span>
        </div>
      )}

      {/* Reply hint */}
      {contact.status !== "REPLIED" && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
          To reply, open your Gmail and reply to the notification email — it
          will automatically go to <strong>{contact.email}</strong>. After
          replying, click <strong>Mark as Replied</strong> above.
        </div>
      )}
    </div>
  );
}
