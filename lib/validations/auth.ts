import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export const passwordSchema = z
  .string()
  .nonempty("Password is required")
  .min(8, "Password must be at least 8 characters long")
  .max(50, "Password cannot exceed 50 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

export const phoneSchema = z
  .string()
  .nonempty("Phone number is required")
  .refine((val) => {
    const phone = parsePhoneNumberFromString(val);
    return phone?.isValid();
  }, "Invalid phone number");

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: passwordSchema,
});
export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().nonempty("Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().nonempty("Password confirmation is required"),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
    if (data.oldPassword === data.newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "New password must be different from current password",
        path: ["newPassword"],
      });
    }
  });

export const contactUserSchema = z.object({
  name: z
    .string()
    .nonempty("Full name is required")
    .min(3, "Full name must be at least 3 characters long")
    .max(30, "Full name cannot exeed 30 characters"),
  email: z.email({ message: "Invalid email address" }),
  phoneNumber: phoneSchema,
  Subject: z
    .string()
    .nonempty("Subject is required")
    .min(3, "Subject must be at least 3 characters long")
    .max(150, "Subject cannot exceed 150 Characters"),
  Message: z
    .string()
    .nonempty("Message is required.")
    .min(15, "Message must be at least 15 characters long"),
});
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().nonempty("Password confirmation is required"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const registerSchema = z
  .object({
    name: z
      .string()
      .nonempty("Name is required")
      .min(3, "Name must be at least 3 characters long")
      .max(40, "Name cannot exceed 40 characters"),
    email: z.email({ message: "Invalid email address" }),

    password: passwordSchema,
    confirmPassword: z.string().nonempty("Password confirmation is required"),

    phoneNumber: phoneSchema,
  })

  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const profileSchema = z.object({
  fullname: z.string().min(3, "Name must be at least 3 characters"),
  bio: z.string().max(1500, "Bio cannot exceed 1500 characters").optional(),
  jobTitle: z.string().optional(),
  jobName: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
});

export const EXTERNAL_URL_MAX_LENGTH = 500;
const externalUrlSchema = z.preprocess(
  (val) => {
    if (val === undefined) return undefined;
    if (val === null) return null;
    if (typeof val !== "string") return val;
    const trimmed = val.trim();
    return trimmed === "" ? null : trimmed;
  },
  z
    .string()
    .max(
      EXTERNAL_URL_MAX_LENGTH,
      `External link must not exceed ${EXTERNAL_URL_MAX_LENGTH} characters`,
    )
    .refine((val) => {
      try {
        return new URL(val).protocol === "https:";
      } catch {
        return false;
      }
    }, "External link must be a valid URL starting with https://")
    .nullable()
    .optional(),
);
function stripQuotaWhenExternal<
  T extends { externalUrl?: unknown; quota?: unknown },
>(data: T): T {
  return data.externalUrl ? { ...data, quota: null } : data;
}

export const CreateEventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Event name is required")
      .min(5, "Event name must be at least 5 characters")
      .max(100, "Event name must not exceed 100 characters"),

    description: z
      .string()
      .min(1, "Description is required")
      .min(20, "Description must be at least 20 characters"),

    location: z.string().max(100).optional().nullable(),

    startDate: z.coerce.date({
      error: "Start date is required",
    }),

    endDate: z.coerce.date({
      error: "End date is required",
    }),

    timeZone: z.string().default("Asia/Jakarta"),

    price: z.coerce.number().min(0, "Price cannot be negative"),

    quota: z.preprocess(
      (val) => (val === "" ? null : val),
      z.coerce.number().int().min(1).nullable().optional(),
    ),
    externalUrl: externalUrlSchema,

    categoryId: z.coerce.number().int().min(1, "Please select a category"),

    coverImage: z.string().optional().nullable(),
    publicId: z.string().optional().nullable(),
    isPublished: z.boolean().optional().default(false),
    industryIds: z.array(z.number().int().positive()).optional().default([]),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after the start date",
    path: ["endDate"],
  })
  .transform(stripQuotaWhenExternal);

export const UpdateEventSchema = z
  .object({
    title: z
      .string()
      .min(5, "Event name must be at least 5 characters")
      .max(100, "Event name must not exceed 100 characters")
      .optional(),

    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .optional(),

    location: z
      .string()
      .max(100, "Location must not exceed 100 characters")
      .optional()
      .nullable(),

    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid start date format")
      .optional(),

    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid end date format")
      .optional(),

    timeZone: z.string().min(1, "Timezone is required").optional(),

    price: z.coerce
      .number()
      .int()
      .min(0, "Price cannot be negative")
      .optional(),

    quota: z.coerce
      .number()
      .int("Quota must be integer")
      .min(1, "Quota must be at least 1 participant")
      .nullable()
      .optional(),

    externalUrl: externalUrlSchema,
    categoryId: z.coerce
      .number()
      .int()
      .min(1, "Category is required")
      .optional(),

    isPublished: z.boolean().optional(),
    coverImage: z.string().optional().nullable(),
    publicId: z.string().optional().nullable(),
    industryIds: z.array(z.number().int().positive()).optional().default([]),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) > new Date(data.startDate);
    },
    {
      message: "End date must be after the start date",
      path: ["endDate"],
    },
  )
  .transform(stripQuotaWhenExternal);

export const CreateCompanySchema = z.object({
  name: z.string().min(1, "Name company is required"),
  description: z.string().min(50, "min 50 Character Description Company"),
  location: z.string().optional(),
  email: z.email("invalid format email").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  logo: z.string().nullable().optional(),
  publicId: z.string().nullable().optional(),
});

export const UpdateCompanyScehma = z.object({
  name: z.string().min(1, "Name company is required"),
  description: z.string().min(50, "Min 50 Character Description Company"),
  logo: z.string().nullable().optional(),
  publicId: z.string().nullable().optional(),
  location: z.string().optional(),
  email: z.email("invalid format email").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
});

export const AttendeeFieldSchema = z.object({
  label: z.string().min(1, "Label is required."),
  key: z.string().min(1, "Key is required"),
  type: z.enum(["TEXT", "EMAIL", "PHONE", "NUMBER", "DATE", "SELECT"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional().nullable(),
  order: z.number().int().default(0),
});

type AttendeeFieldInput = {
  key: string;
  label: string;
  type: "TEXT" | "EMAIL" | "PHONE" | "SELECT" | "TEXTAREA";
  required: boolean;
};

export const buildAttendeeSchema = (fields: AttendeeFieldInput[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;

    if (!field.required) {
      shape[field.key] = z.string().optional().or(z.literal(""));
      continue;
    }

    switch (field.type) {
      case "EMAIL":
        fieldSchema = z.string().email(`${field.label} must be a valid email`);
        break;
      case "PHONE":
        fieldSchema = phoneSchema;
        break;
      case "TEXT":
      case "TEXTAREA":
      case "SELECT":
      default:
        fieldSchema = z.string().min(1, `${field.label} is required`);
        break;
    }

    shape[field.key] = fieldSchema;
  }

  return z.object(shape);
};

export const CreateArticleNewsSchema = z.object({
  title: z.string().min(5, "Article News is required!"),
  slug: z
    .string()
    .min(3, "Min slug 3 Character")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya boleh huruf kecil, angka, dan tanda hubung",
    ),
  type: z.enum(["BLOG", "NEWS"], {
    error: () => ({ message: "Type harus BLOG atau NEWS" }),
  }),
  category: z.enum(["CORPORATE", "EXECUTIVE", "INSIGHT", "UPDATE", "EVENT"], {
    error: () => ({ message: "Pilih kategori yang valid" }),
  }),
  content: z.string().min(100, "Article content must have 100 character!"),
  coverImage: z
    .string()
    .url("Cover image harus berupa URL valid")
    .optional()
    .nullable(),
  publicId: z.string().optional(),
  isActive: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const UpdateArticleSchema = CreateArticleNewsSchema.partial().extend({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug tidak valid")
    .optional(),
});

export const getParticipantsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  status: z.enum(["PENDING", "PAID", "EXPIRED", "CANCELED"]).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ContactUserFormData = z.infer<typeof contactUserSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type CreateEventFormData = z.infer<typeof CreateEventSchema>;
export type UpdateEventFormData = z.infer<typeof UpdateEventSchema>;
export type CreateCompanyFormData = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyFormData = z.infer<typeof UpdateCompanyScehma>;
export type AttendeeFieldFormDataCompany = z.infer<typeof AttendeeFieldSchema>;
export type CreateArticleFormData = z.infer<typeof CreateArticleNewsSchema>;
export type UpdateArticleFormData = z.infer<typeof UpdateArticleSchema>;
export type GetParticipantsQuery = z.infer<typeof getParticipantsQuerySchema>;
