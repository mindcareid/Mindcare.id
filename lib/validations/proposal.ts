import { z } from "zod";

import { phoneSchema } from "./auth";
export const proposalDownloadSchema = z.object({
  fullName: z
    .string()
    .trim()
    .nonempty("Full name is required")
    .min(3, "Full name must be at least 3 characters long")
    .max(255, "Full name cannot exceed 255 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: "Invalid email address" })),

  phone: phoneSchema,
  institution: z
    .string({ error: "Institution is required" })
    .trim()
    .nonempty("Institution is required")
    .max(255, "Institution cannot exceed 255 characters"),

  position: z
    .string({ error: "Position is required" })
    .trim()
    .nonempty("Position is required")
    .max(255, "Position cannot exceed 255 characters"),
  captchaToken: z.string().max(4096).optional(),
});

export type ProposalDownloadInput = z.infer<typeof proposalDownloadSchema>;
