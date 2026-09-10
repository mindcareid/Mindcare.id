"use client";

import LogoCompany from "@/app/(user)/company/component/LogoCompany";
import {
  UpdateCompanyScehma,
  UpdateCompanyFormData,
} from "@/lib/validations/auth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ApiError = {
  message?: string;
};

export default function EditCompanyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedln] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  type FieldErrors = Partial<Record<keyof UpdateCompanyFormData, string>>;
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const EditData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/company/${id}`);
        if (!res.ok) throw new Error(`Failed load Data Company, ${res.status}`);
        const dataCompany = await res.json();
        const company = dataCompany.data;
        setName(company.name ?? "");
        setDesc(company.description ?? "");
        setLocation(company.location ?? "");
        setEmail(company.email ?? "");
        setPhone(company.phone ?? "");
        setWebsite(company.website ?? "");
        setInstagram(company.instagram ?? "");
        setLinkedln(company.linkedin ?? "");
        setLogo(company.logo ?? null);
        setPublicId(company.publicId ?? null);
      } catch (err) {
        console.log("Failed Receive Data");
      } finally {
        setLoading(false);
      }
    };
    if (id) EditData();
  }, [id]);

  const openWidgetCompany = () => {
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: "companies",
        multiple: false,
        cropping: true,
        croppingCoordinatesMode: "custom",
        showSkipCropButton: true,
        folder: "companies",
        showCompletedButton: false,
        singleUploadAutoClose: true,
      },
      async (error: ApiError, result: any) => {
        if (!error && result.event === "success") {
          const photoUrl = result.info.secure_url;
          const publicId = result.info.public_id;

          setLogo(photoUrl);
          setPublicId(publicId);
          toast.success("Photo Company Uploaded!");
        }
      },
    );
    widget.open();
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const payload = {
      name,
      description: desc,
      logo,
      publicId,
      location,
      email,
      phone,
      website,
      instagram,
      linkedin,
    };

    const parsed = UpdateCompanyScehma.safeParse(payload);

    if (!parsed.success) {
      const firstError: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (field && !firstError[field]) {
          firstError[field] = issue.message;
        }
      }
      setFieldErrors(firstError);
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`/api/company/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      console.log("Status:", res.status); // ← tambah
      const json: ApiError = await res.json();
      console.log("Response:", json); // ← tambah
      if (!res.ok) {
        throw new Error(json.message || "Failed to update company");
      }
      toast.success("Company Successfully Update!");
      router.push("/company/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-40">
        <svg
          className="animate-spin h-8 w-8 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      </div>
    );
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-5xl mx-auto p-6 items-center"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <LogoCompany logo={logo} onClick={openWidgetCompany} />
        <div className="flex flex-col justify-start items-start gap-1">
          <button
            type="button"
            onClick={openWidgetCompany}
            className="text-blue-600 font-semibold hover:underline"
          >
            Upload photo
          </button>

          <p className="text-xs text-gray-500">
            • Upload with <span className="font-medium">1:1 (square)</span>{" "}
            ratio.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={4}
          className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {fieldErrors.description && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.description}</p>
        )}
      </div>
      <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Social Media & Contact{" "}
          <span className="text-sm text-gray-400">(Optional)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="West Jakarta"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Company Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@company.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+62 21 1234567"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Website</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://msw-global.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            <span className="text-xs text-gray-500">
              <span className="text-red-500">note*:</span> Enter your Link
              Website example: <strong>https://msw-global.com</strong>
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Instagram
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Msw_global"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500">
              <span className="text-red-500">note*:</span> Enter your Instagram
              username without the <strong>@</strong> symbol.
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              LinkedIn
            </label>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedln(e.target.value)}
              placeholder="linkedin.com/company/..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Process...
          </>
        ) : (
          "Save Change"
        )}
      </button>
    </form>
  );
}
