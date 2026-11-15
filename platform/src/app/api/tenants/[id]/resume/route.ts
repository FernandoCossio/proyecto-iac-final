import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resumeTenant } from "@/lib/orchestrator/runner";
import { logAuditEvent } from "@/lib/audit/audit-logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    const job = await prisma.deploymentJob.create({
      data: {
        tenantId: id,
        operation: "RESUME",
        engine: "cli",
        status: "QUEUED",
      },
    });

    logAuditEvent({
      username: "admin",
      action: "TENANT_RESUME",
      target: `Tenant: ${id}`,
      status: "SUCCESS",
      details: `Reanudación y encendido de instancias del tenant '${tenant.name}'`,
    });

    setImmediate(() => {
      resumeTenant(id, job.id).catch((err) =>
        console.error(`[Orchestrator] Error reanudando tenant ${id}:`, err)
      );
    });

    return NextResponse.json(
      { message: "Reanudación de instancias iniciada", jobId: job.id },
      { status: 202 }
    );
  } catch (error) {
    console.error("[Tenant RESUME] Error:", error);
    return NextResponse.json(
      { error: "Error iniciando reanudación del tenant" },
      { status: 500 }
    );
  }
}
