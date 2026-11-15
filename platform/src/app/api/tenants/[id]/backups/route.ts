import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { runTenantBackup } from "@/lib/orchestrator/runner";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit/audit-logger";

const REPO_ROOT = path.resolve(process.cwd(), "..");

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: tenantId } = await params;
    const backupsDir = path.join(REPO_ROOT, "platform", "backups", tenantId);

    if (!fs.existsSync(backupsDir)) {
      return NextResponse.json({ backups: [] });
    }

    const files = fs
      .readdirSync(backupsDir)
      .filter((f) => f.endsWith(".sql.gz"))
      .map((f) => {
        const fullPath = path.join(backupsDir, f);
        const stat = fs.statSync(fullPath);
        return {
          filename: f,
          sizeBytes: stat.size,
          sizeFormatted: (stat.size / (1024 * 1024)).toFixed(2) + " MB",
          createdAt: stat.birthtime || stat.mtime,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ backups: files });
  } catch (error) {
    console.error("[Backups GET] Error:", error);
    return NextResponse.json({ error: "Error obteniendo lista de respaldos" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: tenantId } = await params;
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    if (tenant.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `El tenant debe estar en estado ACTIVO para realizar un respaldo (estado actual: ${tenant.status})` },
        { status: 400 }
      );
    }

    // Ejecutar respaldo
    const res = await runTenantBackup(tenantId);
    if (!res.success) {
      logAuditEvent({
        username: "admin",
        action: "TENANT_BACKUP",
        target: `Tenant: ${tenantId}`,
        status: "FAILED",
        details: `Fallo en respaldo de base de datos: ${res.error}`,
      });
      return NextResponse.json({ error: res.error || "Fallo en el respaldo" }, { status: 500 });
    }

    logAuditEvent({
      username: "admin",
      action: "TENANT_BACKUP",
      target: `Tenant: ${tenantId}`,
      status: "SUCCESS",
      details: `Respaldo manual generado: ${res.filename}`,
    });

    return NextResponse.json({
      message: "Respaldo generado con éxito",
      filename: res.filename,
    });
  } catch (error) {
    console.error("[Backups POST] Error:", error);
    return NextResponse.json({ error: "Error generando respaldo" }, { status: 500 });
  }
}
