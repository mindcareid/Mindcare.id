"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateIndustryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // async function handleSubmit() {
  //   if (!name.trim()) return;
  //   setLoading(true);

  //   await fetch("/api/cadmin/industries", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ name }),
  //   });
  //   setName("");
  //   setLoading(false);
  //   toast.success("Success Add New Industries ", {
  //     description: " We'll get back to you soon.",
  //   });
  //   router.refresh();
  // }
  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/cadmin/industries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message ?? "Failed to add industry");
      }

      setName("");
      toast.success("Success Add New Industries");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
        {
          description: "Please check again!",
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2">
        <label className="text-base font-semibold text-neutral-900">
          Industry Name
        </label>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter industry name..."
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none "
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex min-w-25 items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Save..." : "Add"}
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Add a new industry category to be used across the platform.
        </p>
      </div>
    </div>
  );
}
