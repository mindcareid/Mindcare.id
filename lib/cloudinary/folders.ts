import { UserRole } from "@prisma/client";
import {
  UPLOAD_FOLDER_ENTITIES,
  UploadFolderImage,
  UploadResourceType,
} from "./types/upload";

type FolderConfig = {
  path: string;
  allowedRoles: UserRole[];
  resourceType?: UploadResourceType;
};

const ALL_AUTHENTICATED: UserRole[] = [
  UserRole.USER,
  UserRole.ADMIN,
  UserRole.SUPERADMIN,
  UserRole.INSTITUTION,
];

const ADMIN_ONLY: UserRole[] = [UserRole.ADMIN, UserRole.SUPERADMIN];

export const APP_DATA_ROOT = "app_data";

function appDataPath(...segments: string[]): string {
  return [APP_DATA_ROOT, ...segments]
    .flatMap((segment) => segment.split("/"))
    .filter(Boolean)
    .join("/");
}

export const FolderImage: Record<UploadFolderImage, FolderConfig> = {
  professionals: {
    path: appDataPath("Professionals"),
    allowedRoles: ALL_AUTHENTICATED,
  },
  users: {
    path: appDataPath("Users", "Avatars"),
    allowedRoles: ALL_AUTHENTICATED,
  },

  "care-centre": {
    path: appDataPath("CareCentre"),
    allowedRoles: [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.INSTITUTION],
  },
  article: {
    path: appDataPath("Articles"),
    allowedRoles: ADMIN_ONLY,
  },
  solutions: {
    path: appDataPath("Solutions"),
    allowedRoles: ADMIN_ONLY,
  },
  events: {
    path: appDataPath("Events"),
    allowedRoles: ALL_AUTHENTICATED,
  },
  categories: {
    path: appDataPath("Categories"),
    allowedRoles: ADMIN_ONLY,
  },
  hero: {
    path: appDataPath("Hero"),
    allowedRoles: ADMIN_ONLY,
  },
  "about-section": {
    path: appDataPath("AboutSection"),
    allowedRoles: ADMIN_ONLY,
  },
  whyus: {
    path: appDataPath("WhyUs"),
    allowedRoles: ADMIN_ONLY,
  },
};
export const LEGACY_DELETE_ONLY_FOLDERS: {
  folder: string;
  allowedRoles: UserRole[];
}[] = [{ folder: "companies", allowedRoles: ADMIN_ONLY }];
export const UPLOAD_ENTITIES = UPLOAD_FOLDER_ENTITIES;

export function isRoleAllowed(
  entityType: UploadFolderImage,
  userRole: UserRole | string | undefined,
): boolean {
  return roleIsInList(FolderImage[entityType].allowedRoles, userRole);
}
export function roleIsInList(
  allowed: UserRole[],
  userRole: UserRole | string | undefined,
): boolean {
  if (allowed.length === 0) return true;
  if (!userRole) return false;
  return allowed.includes(userRole as UserRole);
}
