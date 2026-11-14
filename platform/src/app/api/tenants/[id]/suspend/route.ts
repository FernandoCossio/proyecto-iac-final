import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { suspendTenant } from "@/lib/orchestrator/runner";

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
