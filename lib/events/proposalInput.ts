import {
  isCloudinaryRawAssetUrl,
  isPublicIdInEntityFolder,
} from "@/lib/cloudinary/asset";

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export type ParsedProposal =
  | { ok: true; url: string | null; publicId: string | null }
  | { ok: false; error: string };

export function parseProposal(body: Record<string, unknown>): ParsedProposal {
  const proposalUrl = text(body.proposalUrl);
  const proposalPublicId = text(body.proposalPublicId);

  if (Boolean(proposalUrl) !== Boolean(proposalPublicId)) {
    return {
      ok: false,
      error: "Proposal file and its public id must be provided together",
    };
  }

  if (
    proposalPublicId &&
    !isPublicIdInEntityFolder(proposalPublicId, "event-proposals")
  ) {
    return { ok: false, error: "Proposal file belongs to another folder" };
  }
  if (proposalUrl && !isCloudinaryRawAssetUrl(proposalUrl)) {
    return {
      ok: false,
      error: "Proposal file must be uploaded, not pasted as a link",
    };
  }

  return { ok: true, url: proposalUrl, publicId: proposalPublicId };
}
