"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/app/components/reusable/Button";
import Image from "next/image";

type ApplicationKind = "professional" | "care-centre" | "solution";

type ListingStatus = "PENDING" | "LISTED" | "REJECTED";

type ProfessionalApplication = {
  id: number;
  slug: string;
  fullName: string;
  credentials: string;
  profession: string;
  headline: string;
  bio: string | null;
  photoUrl: string | null;
  baseCity: string;
  baseProvince: string;
  languages: string[] | null;
  yearsOfExperience: number;
  startingPriceIdr: number | null;
  listingStatus: ListingStatus;
  verificationReview: string;
  verificationCheckedOn: string | null;
  verificationValidUntil: string | null;
  verificationNote: string | null;
  licenceType: string | null;
  licenceNumber: string | null;
  licenceValidUntil: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string; phoneNumber: string | null };
  services: {
    id: number;
    name: string;
    mode: string;
    durationMinutes: number;
    priceIdr: number;
  }[];
  areas: { slug: string; name: string }[];
};

type CareCentreApplication = {
  id: number;
  slug: string;
  name: string;
  kind: string;
  description: string | null;
  photoUrl: string | null;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  website: string | null;
  acceptsBpjs: boolean;
  timeZone: string;
  openingNote: string | null;
  listingStatus: ListingStatus;
  verificationReview: string;
  verificationCheckedOn: string | null;
  verificationValidUntil: string | null;
  verificationNote: string | null;
  permitType: string | null;
  permitNumber: string | null;
  permitValidUntil: string | null;
  createdAt: string;
  openingHours: {
    day: number;
    opens: string | null;
    closes: string | null;
  }[];
  services: { slug: string; name: string }[];
  users: {
    id: number;
    status: string;
    user: {
      id: number;
      name: string;
      email: string;
      phoneNumber: string | null;
    };
  }[];
};

type SolutionApplication = {
  id: number;
  slug: string;
  name: string;
  organizationName: string;
  tagline: string | null;
  description: string | null;
  deliveryFormat: string;
  serviceArea: string | null;
  features: string[] | null;
  evidence: { label: string; url?: string | null }[] | null;
  pricingModel: string;
  priceFromIdr: number | null;
  website: string | null;
  brochureUrl: string | null;
  videoUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  logo: string | null;
  coverImage: string | null;
  listingStatus: ListingStatus;
  verificationReview: string;
  verificationCheckedOn: string | null;
  verificationValidUntil: string | null;
  verificationNote: string | null;
  createdAt: string;
  category: { slug: string; name: string };
  audiences: { slug: string; name: string }[];
  focusAreas: { slug: string; name: string }[];
  owner: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string | null;
  } | null;
};

const WEEKDAY_LABELS = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const STATUS_BADGE: Record<ListingStatus, string> = {
  PENDING: "bg-brand-lavender-100 text-secondary",
  LISTED: "bg-brand-mint-100 text-accent",
  REJECTED: "bg-destructive/10 text-destructive",
};

function formatIdr(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateOnly(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ReviewDialog({
  kind,
  application,
  onClose,
  onConfirm,
  processing,
}: {
  kind: ApplicationKind;
  application:
    | ProfessionalApplication
    | CareCentreApplication
    | SolutionApplication;
  onClose: () => void;
  onConfirm: (payload: {
    action: "APPROVE" | "REJECT";
    validUntil?: string;
    reason?: string;
  }) => void;
  processing: boolean;
}) {
  // Solusi tidak punya izin/permit yang punya masa berlaku, jadi tanggalnya
  // boleh dikosongkan. Profesional & centre wajib (izin selalu bertanggal).
  const isSolution = kind === "solution";
  const [validUntil, setValidUntil] = useState(defaultValidUntil(application));
  const [reason, setReason] = useState("");
  const [action, setAction] = useState<"APPROVE" | "REJECT">("APPROVE");

  const entityName =
    "fullName" in application ? application.fullName : application.name;

  let validForApprove = validUntil !== "";
  if (action === "REJECT") validForApprove = true;
  if (isSolution) validForApprove = true;
  const validForReject = action === "APPROVE" || reason.trim().length >= 10;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Review application ${entityName}`}
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          {action === "APPROVE" ? "Approve" : "Reject"} — {entityName}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{kindLabel(kind)}</p>

        <div className="mt-5 flex gap-2">
          {(["APPROVE", "REJECT"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAction(a)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                action === a
                  ? a === "APPROVE"
                    ? "bg-accent text-accent-foreground"
                    : "bg-destructive text-white"
                  : "border border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              {a === "APPROVE" ? "Approve" : "Reject"}
            </button>
          ))}
        </div>

        {action === "APPROVE" ? (
          <div className="mt-5 space-y-1.5">
            <label
              htmlFor="validUntil"
              className="block text-sm font-medium text-foreground"
            >
              {isSolution ? "Checked until (optional)" : "Licence valid until"}{" "}
              {isSolution ? null : <span className="text-destructive">*</span>}
            </label>
            <input
              id="validUntil"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              {isSolution
                ? "Leave empty if the evidence has no expiry. Used to show how long this check is considered current."
                : "The last day the licence is still valid. Default taken from the claim — change it if the registry check says otherwise."}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-1.5">
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-foreground"
            >
              Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain what needs fixing — the applicant will read this."
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters. Shown to the applicant in their
              notification.
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant={action === "APPROVE" ? "accent" : "danger"}
            disabled={processing || !validForApprove || !validForReject}
            onClick={() => {
              if (action === "APPROVE") {
                onConfirm({ action: "APPROVE", validUntil });
                return;
              }
              onConfirm({ action: "REJECT", reason: reason.trim() });
            }}
          >
            {processing
              ? "Processing..."
              : action === "APPROVE"
                ? "Confirm approve"
                : "Confirm reject"}
          </Button>
        </div>
      </div>
    </div>
  );
}
function ApplicationImages({
  application,
}: {
  application:
    | ProfessionalApplication
    | CareCentreApplication
    | SolutionApplication;
}) {
  const items: { url: string; label: string }[] = [];

  if ("organizationName" in application) {
    if (application.logo) items.push({ url: application.logo, label: "Logo" });
    if (application.coverImage) {
      items.push({ url: application.coverImage, label: "Cover image" });
    }
  } else if (application.photoUrl) {
    items.push({ url: application.photoUrl, label: "Photo" });
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap gap-3">
      {items.map((item) => (
        <figure key={item.url} className="space-y-1">
          <Image
            src={item.url}
            alt={item.label}
            width={96}
            height={96}
            className="h-24 w-24 rounded-lg border border-border object-cover"
          />
          <figcaption className="text-xs text-muted-foreground">
            {item.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function SolutionDetail({ application }: { application: SolutionApplication }) {
  const features = Array.isArray(application.features)
    ? application.features
    : [];
  const evidence = Array.isArray(application.evidence)
    ? application.evidence
    : [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailRow label="Organisation" value={application.organizationName} />
        <DetailRow label="Category" value={application.category.name} />
        <DetailRow label="Delivery" value={application.deliveryFormat} />
        <DetailRow
          label="Service area"
          value={application.serviceArea ?? "—"}
        />
        <DetailRow label="Pricing" value={application.pricingModel} />
        <DetailRow
          label="Price from"
          value={
            application.priceFromIdr !== null
              ? formatIdr(application.priceFromIdr)
              : "—"
          }
        />
        <DetailRow
          label="Target users"
          value={application.audiences.map((a) => a.name).join(", ") || "—"}
        />
        <DetailRow
          label="Problems addressed"
          value={application.focusAreas.map((a) => a.name).join(", ") || "—"}
        />
        <DetailRow label="Website" value={application.website ?? "—"} />
        <DetailRow label="Brochure" value={application.brochureUrl ?? "—"} />
        <DetailRow label="Video" value={application.videoUrl ?? "—"} />
        <DetailRow
          label="Contact email"
          value={application.contactEmail ?? "—"}
        />
        <DetailRow
          label="Contact phone"
          value={application.contactPhone ?? "—"}
        />
      </div>

      {application.tagline ? (
        <div>
          <p className="text-xs text-muted-foreground">One-line summary</p>
          <p className="text-sm text-foreground">{application.tagline}</p>
        </div>
      ) : null}

      {application.description ? (
        <div>
          <p className="text-xs text-muted-foreground">Description</p>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {application.description}
          </p>
        </div>
      ) : null}

      {features.length > 0 ? (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Key features</p>
          <ul className="list-inside list-disc space-y-0.5">
            {features.map((feature) => (
              <li key={feature} className="text-sm text-foreground">
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {evidence.length > 0 ? (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">
            Evidence claimed by the applicant
          </p>
          <ul className="space-y-0.5">
            {evidence.map((item, index) => (
              <li
                key={`${item.label}-${index}`}
                className="text-sm text-foreground"
              >
                {item.label}
                {item.url ? (
                  <>
                    {" — "}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-primary hover:underline"
                    >
                      link
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function kindLabel(kind: ApplicationKind): string {
  if (kind === "professional") return "Professional application";
  if (kind === "care-centre") return "Care centre application";
  return "Solution application";
}

function defaultValidUntil(
  application:
    | ProfessionalApplication
    | CareCentreApplication
    | SolutionApplication,
): string {
  if ("licenceValidUntil" in application) {
    return application.licenceValidUntil ?? "";
  }
  if ("permitValidUntil" in application) {
    return application.permitValidUntil ?? "";
  }
  return "";
}

export default function ApplicationsPage() {
  const [kind, setKind] = useState<ApplicationKind>("professional");
  const [status, setStatus] = useState<ListingStatus>("PENDING");
  const [professionals, setProfessionals] = useState<ProfessionalApplication[]>(
    [],
  );
  const [centres, setCentres] = useState<CareCentreApplication[]>([]);
  const [solutions, setSolutions] = useState<SolutionApplication[]>([]);
  const [fetchedKinds, setFetchedKinds] = useState<Set<string>>(new Set());
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reviewTarget, setReviewTarget] = useState<
    ProfessionalApplication | CareCentreApplication | SolutionApplication | null
  >(null);
  const fetchKey = `${kind}:${status}`;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(
          `/api/cadmin/applications/${kind}?status=${status}`,
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to load");
        if (cancelled) return;
        if (kind === "professional") {
          setProfessionals(json.data ?? []);
        } else if (kind === "care-centre") {
          setCentres(json.data ?? []);
        } else {
          setSolutions(json.data ?? []);
        }
      } catch (err) {
        if (cancelled) return;
        toast.error(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setFetchedKinds((prev) => new Set(prev).add(fetchKey));
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  let list:
    | ProfessionalApplication[]
    | CareCentreApplication[]
    | SolutionApplication[] = solutions;
  if (kind === "professional") list = professionals;
  else if (kind === "care-centre") list = centres;

  const loading = !fetchedKinds.has(fetchKey);
  const count = list.length;

  const handleConfirm = async (payload: {
    action: "APPROVE" | "REJECT";
    validUntil?: string;
    reason?: string;
  }) => {
    if (!reviewTarget) return;
    const { action, ...rest } = payload;

    setProcessingId(reviewTarget.id);
    try {
      const res = await fetch(
        `/api/cadmin/applications/${kind}/${reviewTarget.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...rest }),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to review");

      toast.success(
        action === "APPROVE" ? "Application approved" : "Application rejected",
      );
      setReviewTarget(null);
      setFetchedKinds((prev) => {
        const next = new Set(prev);
        next.delete(fetchKey);
        return next;
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to review");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Directory applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review professional, care centre, and solution applications before
            they go live.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["professional", "Professional"],
              ["care-centre", "Care centre"],
              ["solution", "Solution"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setKind(value)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                kind === value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {(["PENDING", "LISTED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              status === s
                ? "bg-secondary text-secondary-foreground"
                : "border border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : count === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No {status.toLowerCase()} applications.
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((application) => {
            const isProfessional = "fullName" in application;
            const isSolution = "organizationName" in application;
            const entityName = isProfessional
              ? application.fullName
              : application.name;
            let subLabel = "";
            if ("fullName" in application) {
              subLabel = `${application.credentials} · ${application.baseCity}`;
            } else if ("organizationName" in application) {
              subLabel = `${application.organizationName} · ${application.category.name}`;
            } else {
              subLabel = `${application.kind} · ${application.city}`;
            }

            let applicant: { name: string; email: string } | null = null;
            if ("fullName" in application) {
              applicant = application.user;
            } else if ("organizationName" in application) {
              applicant = application.owner;
            } else {
              applicant = application.users[0]?.user ?? null;
            }

            const expanded = expandedId === application.id;

            return (
              <div
                key={application.id}
                className="rounded-xl border border-border bg-card shadow-card"
              >
                <div className="flex w-full items-start justify-between gap-4 p-5 text-left">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expanded ? null : application.id)
                    }
                    aria-expanded={expanded}
                    className="flex-1 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-lg font-semibold text-foreground">
                          {entityName}
                        </h2>
                        <span
                          className={cn(
                            "rounded-sm px-2 py-0.5 text-xs font-medium",
                            STATUS_BADGE[application.listingStatus],
                          )}
                        >
                          {application.listingStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {subLabel}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Submitted {formatDateOnly(application.createdAt)}
                        {applicant
                          ? ` · ${applicant.name} (${applicant.email})`
                          : ""}
                      </p>
                    </div>
                  </button>
                  <span className="flex items-center gap-2">
                    {application.listingStatus === "PENDING" && (
                      <Button
                        size="sm"
                        icon={Check}
                        onClick={() => setReviewTarget(application)}
                      >
                        Review
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expanded ? null : application.id)
                      }
                      aria-label={
                        expanded ? "Collapse details" : "Expand details"
                      }
                      aria-expanded={expanded}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                    >
                      {expanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </span>
                </div>

                {expanded && (
                  <div className="border-t border-border p-5">
                    <ApplicationImages application={application} />
                    {isProfessional ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <DetailRow
                          label="Profession"
                          value={application.profession}
                        />
                        <DetailRow
                          label="Experience"
                          value={`${application.yearsOfExperience} years`}
                        />
                        <DetailRow
                          label="Starting price"
                          value={
                            application.startingPriceIdr !== null
                              ? formatIdr(application.startingPriceIdr)
                              : "—"
                          }
                        />
                        <DetailRow
                          label="Languages"
                          value={
                            (application.languages ?? []).join(", ") || "—"
                          }
                        />
                        <DetailRow
                          label="Areas of support"
                          value={
                            application.areas.map((a) => a.name).join(", ") ||
                            "—"
                          }
                        />
                        <DetailRow
                          label="Licence"
                          value={`${application.licenceType ?? "—"} · ${application.licenceNumber ?? "—"} · until ${formatDateOnly(application.licenceValidUntil)}`}
                        />
                        <div className="sm:col-span-2 lg:col-span-3">
                          <p className="text-xs text-muted-foreground">
                            Headline
                          </p>
                          <p className="text-sm text-foreground">
                            {application.headline}
                          </p>
                        </div>
                        {application.services.length > 0 && (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <p className="mb-2 text-xs text-muted-foreground">
                              Services
                            </p>
                            <div className="space-y-1">
                              {application.services.map((service) => (
                                <p
                                  key={service.id}
                                  className="text-sm text-foreground"
                                >
                                  {service.name} · {service.mode} ·{" "}
                                  {service.durationMinutes} min ·{" "}
                                  {formatIdr(service.priceIdr)}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                        {application.bio && (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <p className="text-xs text-muted-foreground">
                              About
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {application.bio}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : isSolution ? (
                      <SolutionDetail application={application} />
                    ) : (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <DetailRow label="Kind" value={application.kind} />
                          <DetailRow
                            label="Address"
                            value={`${application.street}, ${application.city}, ${application.province} ${application.postalCode}`}
                          />
                          <DetailRow label="Phone" value={application.phone} />
                          <DetailRow
                            label="Website"
                            value={application.website ?? "—"}
                          />
                          <DetailRow
                            label="BPJS"
                            value={
                              application.acceptsBpjs
                                ? "Accepted"
                                : "Not accepted"
                            }
                          />
                          <DetailRow
                            label="Time zone"
                            value={application.timeZone}
                          />
                          <DetailRow
                            label="Services"
                            value={
                              application.services
                                .map((s) => s.name)
                                .join(", ") || "—"
                            }
                          />
                          <DetailRow
                            label="Permit"
                            value={`${application.permitType ?? "—"} · ${application.permitNumber ?? "—"} · until ${formatDateOnly(application.permitValidUntil)}`}
                          />
                          <DetailRow
                            label="Owner"
                            value={
                              application.users[0]
                                ? `${application.users[0].user.name} (${application.users[0].status})`
                                : "—"
                            }
                          />
                        </div>
                        <div>
                          <p className="mb-2 text-xs text-muted-foreground">
                            Opening hours
                          </p>
                          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
                            {application.openingHours.map((hour) => (
                              <p
                                key={hour.day}
                                className="text-sm text-foreground"
                              >
                                {WEEKDAY_LABELS[hour.day]}:{" "}
                                {hour.opens && hour.closes
                                  ? `${hour.opens} – ${hour.closes}`
                                  : "Closed"}
                              </p>
                            ))}
                          </div>
                          {application.openingNote && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              {application.openingNote}
                            </p>
                          )}
                        </div>
                        {application.description && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Description
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {application.description}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {application.listingStatus !== "PENDING" && (
                      <div className="mt-5 rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
                        Reviewed{" "}
                        {formatDateOnly(application.verificationCheckedOn)}
                        {" · valid until "}
                        {formatDateOnly(application.verificationValidUntil)}
                        {application.verificationNote
                          ? ` · note: ${application.verificationNote}`
                          : ""}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {reviewTarget && (
        <ReviewDialog
          kind={kind}
          application={reviewTarget}
          processing={processingId === reviewTarget.id}
          onClose={() => setReviewTarget(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
