import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { destroyTenant } from "@/lib/orchestrator/runner";
import { logAuditEvent } from "@/lib/audit/audit-logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        deploymentJobs: {
          orderBy: { startedAt: "desc" },
          take: 5,
          include: {
            logs: {
              orderBy: { timestamp: "asc" },
              take: 200,
            },
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error("[Tenant GET ID] Error:", error);
    return NextResponse.json(
      { error: "Error obteniendo datos del tenant" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const purge = url.searchParams.get("purge") === "true";

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    // Si el tenant ya está terminado o se solicita purga directa, eliminar de la BD y del disco
    if (tenant.status === "TERMINATED" || purge) {
      await prisma.tenant.delete({ where: { id } });
      const tenantDir = path.resolve(process.cwd(), "tenants-data", id);
      if (fs.existsSync(tenantDir)) {
        fs.rmSync(tenantDir, { recursive: true, force: true });
      }
      logAuditEvent({
        username: "admin",
        action: "TENANT_PURGE",
        target: `Tenant: ${id}`,
        status: "SUCCESS",
        details: `Depuración y borrado permanente de datos del tenant '${tenant.name}'`,
      });
      return NextResponse.json({ message: "Registro de tenant depurado exitosamente" });
    }

    // Crear trabajo de destrucción
    const job = await prisma.deploymentJob.create({
      data: {
        tenantId: id,
        operation: "DESTROY",
        engine: tenant.iacEngine,
        status: "QUEUED",
      },
    });

    logAuditEvent({
      username: "admin",
      action: "TENANT_DESTROY",
      target: `Tenant: ${id}`,
      status: "SUCCESS",
      details: `Destrucción completa de infraestructura cloud del tenant '${tenant.name}' ($0 residual)`,
    });

    // Iniciar destrucción asíncrona
    setImmediate(() => {
      destroyTenant(id, job.id).catch((err) =>
        console.error(`[Orchestrator] Error en destroy job ${job.id}:`, err)
      );
    });

    return NextResponse.json(
      { message: "Operación de destrucción de infraestructura iniciada", jobId: job.id },
      { status: 202 }
    );
  } catch (error) {
    console.error("[Tenant DELETE ID] Error:", error);
    return NextResponse.json(
      { error: "Error iniciando la eliminación del tenant" },
      { status: 500 }
    );
  }
}
