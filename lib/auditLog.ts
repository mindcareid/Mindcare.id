import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { AdminRole, Prisma, PrismaClient } from "@prisma/client";
import { resolveAdminRole } from "@/lib/adminAccess";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export type AuditActor = {
  id: number;
  name: string;
  role: AdminRole;
  ip?: string;
  userAgent?: string;
};

/**
 * Override opsional untuk konteks non-request (mis. script). Di web, aktor
 * biasanya dibaca langsung dari sesi saat penulisan terjadi.
 */
const store = new AsyncLocalStorage<AuditActor>();

export function setAuditActor(actor: AuditActor): void {
  store.enterWith(actor);
}

export function getAuditActor(): AuditActor | undefined {
  return store.getStore();
}

/** Model yang tidak ikut dicatat (log-nya sendiri). */
const SKIP_MODELS = new Set<string>(["AuditLog"]);

/** Field yang tidak boleh ikut tersimpan di log. */
const SENSITIVE_FIELDS = new Set<string>([
  "password",
  "resetPasswordToken",
  "resetPasswordExpires",
  "emailVerificationToken",
  "emailVerificationExpires",
  "token",
  "secret",
  "otp",
]);

function redact(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = SENSITIVE_FIELDS.has(key) ? "[redacted]" : value;
  }
  return out;
}

/** Redaksi field sensitif + normalisasi supaya aman disimpan sebagai Json. */
function toJson(record: unknown): Prisma.InputJsonValue | undefined {
  if (record === null || record === undefined) return undefined;

  const value = Array.isArray(record)
    ? record.map((item) =>
        item && typeof item === "object"
          ? redact(item as Record<string, unknown>)
          : item,
      )
    : typeof record === "object"
      ? redact(record as Record<string, unknown>)
      : record;

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function classify(operation: string): AuditAction | null {
  if (operation === "create" || operation === "createMany") return "CREATE";
  if (
    operation === "update" ||
    operation === "updateMany" ||
    operation === "upsert"
  ) {
    return "UPDATE";
  }
  if (operation === "delete" || operation === "deleteMany") return "DELETE";
  return null;
}

type ReadDelegate = {
  findUnique: (args: { where: unknown }) => Promise<unknown>;
  findMany: (args: { where?: unknown }) => Promise<unknown[]>;
};

async function readBefore(
  delegate: ReadDelegate | undefined,
  operation: string,
  where: unknown,
): Promise<unknown> {
  if (!delegate) return undefined;
  try {
    if (operation === "updateMany" || operation === "deleteMany") {
      return await delegate.findMany({ where });
    }
    if (operation === "create" || operation === "createMany") return undefined;
    return await delegate.findUnique({ where });
  } catch {
    return undefined;
  }
}

function extractEntityId(result: unknown, where: unknown): string | undefined {
  const res = result as { id?: unknown } | null;
  if (res && (typeof res.id === "number" || typeof res.id === "string")) {
    return String(res.id);
  }
  const filter = where as { id?: unknown } | undefined;
  if (filter && (typeof filter.id === "number" || typeof filter.id === "string")) {
    return String(filter.id);
  }
  return undefined;
}

/**
 * Extension Prisma yang merekam create/update/delete. Aktor diambil dari
 * override (ALS) bila ada, kalau tidak dibaca dari sesi request — jadi tidak
 * bergantung pada ALS yang tidak menular dari fungsi guard.
 *
 * Penulisan log memakai `base` (client tanpa extension) supaya tidak rekursi,
 * dan kegagalan menulis log tidak pernah membatalkan aksi.
 */
export function createAuditExtension(base: PrismaClient) {
  const delegates = base as unknown as Record<string, ReadDelegate | undefined>;

  // Kelompokkan penulisan beruntun oleh aktor yang sama (satu aksi admin bisa
  // menulis beberapa baris) ke satu requestId.
  let lastRequest: { actorId: number; requestId: string; at: number } | null =
    null;

  function nextRequestId(actorId: number): string {
    const now = Date.now();
    if (
      lastRequest &&
      lastRequest.actorId === actorId &&
      now - lastRequest.at < 1500
    ) {
      lastRequest.at = now;
      return lastRequest.requestId;
    }
    const requestId = randomUUID();
    lastRequest = { actorId, requestId, at: now };
    return requestId;
  }

  async function resolveActor(): Promise<AuditActor | null> {
    const override = store.getStore();
    if (override) return override;

    try {
      const [{ getServerSession }, { authOptions }, { headers }] =
        await Promise.all([
          import("next-auth"),
          import("@/lib/auth"),
          import("next/headers"),
        ]);

      const session = await getServerSession(authOptions);
      const userId = session?.user?.id ? Number(session.user.id) : NaN;
      if (!Number.isFinite(userId)) return null;

      const user = await base.user.findFirst({
        where: { id: userId, isActive: true, deletedAt: null },
        select: {
          id: true,
          name: true,
          role: true,
          adminAccess: { select: { role: true, isActive: true } },
        },
      });
      if (!user) return null;

      const role = resolveAdminRole(user.adminAccess, user.role);
      if (!role) return null;

      let ip: string | undefined;
      let userAgent: string | undefined;
      try {
        const requestHeaders = headers();
        const forwarded = requestHeaders.get("x-forwarded-for");
        ip =
          forwarded?.split(",")[0]?.trim() ||
          requestHeaders.get("x-real-ip") ||
          undefined;
        userAgent = requestHeaders.get("user-agent") ?? undefined;
      } catch {
        // bukan request scope — biarkan ip/user-agent kosong
      }

      return { id: user.id, name: user.name, role, ip, userAgent };
    } catch {
      return null;
    }
  }

  return Prisma.defineExtension((client) =>
    client.$extends({
      name: "audit-log",
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const action = classify(operation);
            if (!action || SKIP_MODELS.has(model)) {
              return query(args);
            }

            const actor = await resolveActor();
            if (!actor) {
              return query(args);
            }

            const queryArgs = (args ?? {}) as Record<string, unknown>;
            const before = await readBefore(
              delegates[model],
              operation,
              queryArgs.where,
            );
            const result = await query(args);

            try {
              await base.auditLog.create({
                data: {
                  actorId: actor.id,
                  actorName: actor.name,
                  actorRole: actor.role,
                  action,
                  entity: model,
                  entityId: extractEntityId(result, queryArgs.where),
                  before: toJson(before),
                  after: action === "DELETE" ? undefined : toJson(result),
                  ip: actor.ip ?? null,
                  userAgent: actor.userAgent ?? null,
                  requestId: nextRequestId(actor.id),
                },
              });
            } catch (error) {
              console.error("[audit] failed to write log", error);
            }

            return result;
          },
        },
      },
    }),
  );
}
