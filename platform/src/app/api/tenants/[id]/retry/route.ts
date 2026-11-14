import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startDeploymentJob } from "@/lib/orchestrator/runner";
import { CreateTenantInput } from "@/lib/validators/tenant.schema";

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
        operation: "CREATE",
        engine: tenant.iacEngine,
        status: "QUEUED",
      },
    });

    const tenantInput: CreateTenantInput = {
      id: tenant.id,
      name: tenant.name,
      adminEmail: tenant.adminEmail,
      region: tenant.region,
      environment: tenant.environment as "prod" | "staging" | "dev",
      planId: tenant.planId as "basico" | "estandar" | "avanzado",
      cloudProvider: tenant.cloudProvider as "aws" | "azure",
      iacEngine: tenant.iacEngine as "terraform" | "opentofu" | "cloudformation" | "pulumi",
      adminUser: "admin_tenant",
      adminPassword: "AdminTenant2026!",
      sshKeyName: "iac-asistencia",
      allowedCidr: "0.0.0.0/0",
    };

    setImmediate(() => {
      startDeploymentJob(tenantInput, job.id).catch((err) =>
        console.error(`[Orchestrator] Error en retry job ${job.id}:`, err)
      );
    });

    return NextResponse.json(
      { message: "Reintento de aprovisionamiento iniciado", jobId: job.id },
      { status: 202 }
    );
  } catch (error) {
    console.error("[Tenant RETRY] Error:", error);
    return NextResponse.json(
      { error: "Error iniciando reintento del tenant" },
      { status: 500 }
    );
  }
}
