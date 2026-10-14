"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/app/components/reusable/Button";

export default function CreateIndustryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

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
      toast.success("Industry added");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <label className="mb-2 block text-sm font-medium text-foreground">
        Industry Name
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Enter industry name..."
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <Button
          onClick={handleSubmit}
          isLoading={loading}
          className="sm:min-w-24"
        >
          Add
        </Button>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Add a new industry category to be used across the platform.
      </p>
    </div>
  );
}
