import { prisma } from "../prisma";

export interface AuditEventInput {
  username?: string;
  userRole?: string;
  action: string;
  target: string;
  status: "SUCCESS" | "FAILED" | "WARNING" | "INFO";
  details?: string | Record<string, unknown>;
  ipAddress?: string;
}

export async function logAuditEvent(input: AuditEventInput): Promise<void> {
  try {
    const detailsStr =
      typeof input.details === "object"
        ? JSON.stringify(input.details)
        : input.details || null;

    await prisma.auditLog.create({
      data: {
        username: input.username || "Sistema",
        userRole: input.userRole || "ADMIN",
        action: input.action,
        target: input.target,
        status: input.status,
        details: detailsStr,
        ipAddress: input.ipAddress || null,
      },
    });
    console.log(`[Audit] ${input.action} en ${input.target} por ${input.username || "Sistema"} -> ${input.status}`);
  } catch (err) {
    console.error("[AuditLogger] Error registrando evento de auditoría:", err);
  }
}
