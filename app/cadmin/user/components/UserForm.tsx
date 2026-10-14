"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Button from "@/app/components/reusable/Button";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

type UserFormProps = {
  id?: number;
  defaultValues?: Partial<UserFormFields>;
};

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

type UserFormFields = {
  email: string;
  username: string;
  name: string;
  password?: string;
  phoneNumber?: string;
  bio?: string;
  instagram?: string;
  facebook?: string;
  isActive: boolean;
  image?: {
    secure_url: string;
    public_id: string;
  };
};

export default function UserForm({ id, defaultValues }: UserFormProps) {
  const [form, setForm] = useState<UserFormFields>({
    email: "",
    username: "",
    name: "",
    password: "",
    phoneNumber: "",
    bio: "",
    instagram: "",
    facebook: "",
    isActive: true,
    image: defaultValues?.image ?? undefined, // 👈 ini penting
    ...defaultValues,
  });

  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { data: session, update } = useSession();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target;
    const { name, value, type } = target;

    if (type === "checkbox" && target instanceof HTMLInputElement) {
      setForm((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await uploadToCloudinary(file, "users");

      setForm((prev) => ({
        ...prev,
        image: {
          secure_url: data.secure_url,
          public_id: data.public_id,
        },
      }));
      toast.success("Image uploaded!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/user${id ? `?id=${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        // Kalau admin mengedit akunnya sendiri, segarkan sesi agar perubahan
        // langsung terlihat tanpa login ulang.
        if (id && session?.user?.id && Number(session.user.id) === id) {
          await update();
        }
        toast.success(id ? "User updated" : "User created");
        router.push("/cadmin/user");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Failed to submit");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-5xl rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
    >
      <h2 className="mb-6 font-heading text-xl font-semibold text-foreground">
        {id ? "Edit User" : "Create User"}
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* === LEFT COLUMN === */}
        <div className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Name"
            className={inputClass}
          />
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            placeholder="Username"
            className={inputClass}
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className={inputClass}
          />
          {!id && (
            <input
              type="password"
              name="password"
              value={form.password || ""}
              onChange={handleChange}
              placeholder="Initial password (optional)"
              className={inputClass}
            />
          )}
          <input
            name="phoneNumber"
            value={form.phoneNumber || ""}
            onChange={handleChange}
            placeholder="Phone Number"
            className={inputClass}
          />
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="space-y-4">
          <input
            name="instagram"
            value={form.instagram || ""}
            onChange={handleChange}
            placeholder="Instagram"
            className={inputClass}
          />
          <input
            name="facebook"
            value={form.facebook || ""}
            onChange={handleChange}
            placeholder="Facebook"
            className={inputClass}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Bio
            </label>
            <ReactQuill
              value={form.bio || ""}
              onChange={(value) => setForm((prev) => ({ ...prev, bio: value }))}
              theme="snow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-brand-lavender-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-secondary hover:file:bg-brand-lavender-200"
            />
            {form.image?.secure_url && (
              <div className="mt-2">
                <Image
                  src={form.image.secure_url}
                  alt="Preview"
                  width={96}
                  height={96}
                  className="size-24 rounded-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="submit" isLoading={submitting}>
          {id ? "Update User" : "Create User"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
