"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

type UserFormProps = {
  id?: number;
  defaultValues?: Partial<UserFormFields>;
};

type UserFormFields = {
  email: string;
  username: string;
  name: string;
  password?: string;
  phoneNumber?: string;
  bio?: string;
  instagram?: string;
  facebook?: string;
  role: "ADMIN" | "SUPERADMIN" | "USER";
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
    role: "USER",
    isActive: true,
    image: defaultValues?.image ?? undefined, // 👈 ini penting
    ...defaultValues,
  });

  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "member"); // 👈 Pastikan preset ini ada di Cloudinary

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dc87bbdnl/image/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await res.json();

    if (data.secure_url && data.public_id) {
      setForm((prev) => ({
        ...prev,
        image: {
          secure_url: data.secure_url,
          public_id: data.public_id,
        },
      }));
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
        router.push("/cadmin/user");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to submit");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-7xl mx-auto bg-white p-6 rounded shadow"
    >
      <h2 className="text-xl font-semibold mb-6">
        {id ? "Edit User" : "Create User"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* === LEFT COLUMN === */}
        <div className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Name"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            placeholder="Username"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
          <input
            type="password"
            name="password"
            value={form.password || ""}
            onChange={handleChange}
            placeholder="Password (optional)"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
          <input
            name="phoneNumber"
            value={form.phoneNumber || ""}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="space-y-4">
          <input
            name="instagram"
            value={form.instagram || ""}
            onChange={handleChange}
            placeholder="Instagram"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
          <input
            name="facebook"
            value={form.facebook || ""}
            onChange={handleChange}
            placeholder="Facebook"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          >
            <option value="USER">User</option>
            <option value="SUPERADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
          </select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <ReactQuill
              value={form.bio || ""}
              onChange={(value) => setForm((prev) => ({ ...prev, bio: value }))}
              theme="snow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0 file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {form.image?.secure_url && (
              <div className="mt-2">
                <Image
                  src={form.image.secure_url}
                  alt="Preview"
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {submitting ? "Submitting..." : id ? "Update User" : "Create User"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
