import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { suspendTenant } from "@/lib/orchestrator/runner";
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
        operation: "SUSPEND",
        engine: "cli",
        status: "QUEUED",
      },
    });

    logAuditEvent({
      username: "admin",
      action: "TENANT_SUSPEND",
      target: `Tenant: ${id}`,
      status: "SUCCESS",
      details: `Suspensión de instancias de tenant '${tenant.name}' para reducción a $0 costo de cómputo`,
    });

    setImmediate(() => {
      suspendTenant(id, job.id).catch((err) =>
        console.error(`[Orchestrator] Error suspendiendo tenant ${id}:`, err)
      );
    });

    return NextResponse.json(
      { message: "Suspensión de instancias iniciada ($0 cómputo)", jobId: job.id },
      { status: 202 }
    );
  } catch (error) {
    console.error("[Tenant SUSPEND] Error:", error);
    return NextResponse.json(
      { error: "Error iniciando suspensión del tenant" },
      { status: 500 }
    );
  }
}
