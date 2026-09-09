"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LogoCompany from "../component/LogoCompany";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  CreateCompanySchema,
  CreateCompanyFormData,
} from "@/lib/validations/auth";
import TermsCompany from "../component/TermsCompany";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
type ApiError = {
  message?: string;
};

type CloudinaryWidget = {
  createUploadWidget: (
    options: Record<string, unknown>,
    callback: (error: unknown, result: CloudinaryResult) => void,
  ) => {
    open: () => void;
  };
};

type CloudinaryResult = {
  event: string;
  info: {
    secure_url: string;
    public_id: string;
  };
};

export default function CreateCompanyPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedln, setLinkedln] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingCompany, setCheckingCompany] = useState(true);
  const [accepted, setAccepted] = useState(false);

  type FieldErrors = Partial<Record<keyof CreateCompanyFormData, string>>;
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const openWidgetCompany = () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = "companies";

    const cloudinary = (window as unknown as { cloudinary: CloudinaryWidget })
      .cloudinary;

    const widget = cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        multiple: false,
        cropping: true,
        croppingCoordinatesMode: "custom",
        showSkipCropButton: true,
        folder: "companies",
        showCompletedButton: false,
        singleUploadAutoClose: true,
      },
      (error, result) => {
        if (!error && result?.event === "success") {
          setLogo(result.info.secure_url);
          setPublicId(result.info.public_id);
          toast.success("Logo uploaded!");
        }
      },
    );

    widget.open();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const payload = {
      name,
      description,
      location,
      email,
      phone,
      website,
      instagram,
      linkedln,
      logo,
      publicId,
    };

    const parsed = CreateCompanySchema.safeParse(payload);
    if (!parsed.success) {
      const firstErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (field && !firstErrors[field]) {
          firstErrors[field] = issue.message;
        }
      }
      setFieldErrors(firstErrors);
      return;
    }

    if (!accepted) {
      toast.info(
        "You must accept the terms and conditions to create a company",
        {
          description:
            "Please read and accept the terms and conditions before submitting your company application.",
        },
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const json: ApiError = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to create company");
      }
      toast.success("Company submitted! Please wait for approval.");
      await update();
      router.push("/company/pending");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth/login");
      return;
    }

    const companyStatus = session.user?.companyStatus;

    if (companyStatus === "ACTIVE") {
      router.replace("/company/dashboard");
    } else if (companyStatus === "PENDING") {
      router.replace("/company/pending");
    } else {
      setCheckingCompany(false);
    }
  }, [status, session, router]);

  if (status === "loading" || checkingCompany) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-10 h-10 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-base text-gray-500">
          Checking your company status...
        </p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Create Your Company
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          Set up your organization to start publishing events.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-600 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name)
                  setFieldErrors((p) => ({ ...p, name: undefined }));
              }}
              required
              placeholder="Example: Execorner"
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* LOGO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Logo <span className="text-red-500">*</span>
            </label>

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
                  • Upload with{" "}
                  <span className="font-medium">1:1 (square)</span> ratio.
                </p>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>

            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (fieldErrors.description)
                  setFieldErrors((p) => ({ ...p, description: undefined }));
              }}
              rows={4}
              placeholder="Tell us about your company..."
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-500 mt-1">
                {fieldErrors.description}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (fieldErrors.location)
                    setFieldErrors((p) => ({ ...p, location: undefined }));
                }}
                placeholder="West Jakarta"
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {fieldErrors.location && (
                <p className="text-xs text-red-500 mt-1">
                  {fieldErrors.location}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Email <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email)
                    setFieldErrors((p) => ({ ...p, email: undefined }));
                }}
                placeholder="contact@company.com"
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Company <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone)
                    setFieldErrors((p) => ({ ...p, phone: undefined }));
                }}
                placeholder="+62 21 1234567"
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {fieldErrors.phone && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  if (fieldErrors.website)
                    setFieldErrors((p) => ({ ...p, website: undefined }));
                }}
                placeholder="https://msw-global.com"
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-xs text-gray-500">
                <span className="text-red-500">note*:</span> Enter your Link
                Website example: <strong>https://msw-global.com</strong>
              </span>
              {fieldErrors.website && (
                <p className="text-xs text-red-500 mt-1">
                  {fieldErrors.website}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => {
                  setInstagram(e.target.value);
                  if (fieldErrors.instagram)
                    setFieldErrors((p) => ({ ...p, instagram: undefined }));
                }}
                placeholder="Msw_global"
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-xs text-gray-500">
                <span className="text-red-500">note*:</span> Enter your
                Instagram username without the <strong>@</strong> symbol.
              </span>
              {fieldErrors.instagram && (
                <p className="text-xs text-red-500 mt-1">
                  {fieldErrors.instagram}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={linkedln}
                onChange={(e) => {
                  setLinkedln(e.target.value);
                  if (fieldErrors.linkedln)
                    setFieldErrors((p) => ({ ...p, linkedln: undefined }));
                }}
                placeholder="https://linkedin.com/company/..."
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <TermsCompany checked={accepted} onChange={setAccepted} />

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={buttonStyles({ className:"w-full", size: "lg" })}
          >
            {loading ? "Creating..." : "Create Company"}
          </button>
        </form>
      </div>
    </main>
  );
}
