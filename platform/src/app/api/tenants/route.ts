import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateTenantSchema } from "@/lib/validators/tenant.schema";
import { startDeploymentJob } from "@/lib/orchestrator/runner";

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        deploymentJobs: {
          take: 1,
          orderBy: { startedAt: "desc" },
        },
      },
    });

    return NextResponse.json({ tenants });
  } catch (error) {
    console.error("[Tenants GET] Error:", error);
    return NextResponse.json(
      { error: "Error obteniendo la lista de tenants" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateTenantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos del formulario inválidos", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verificar si el slug ya existe
    const existing = await prisma.tenant.findUnique({
      where: { id: data.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: `El identificador de tenant '${data.id}' ya está registrado` },
        { status: 409 }
      );
    }

    // 1. Crear registro de Tenant
    const tenant = await prisma.tenant.create({
      data: {
        id: data.id,
        name: data.name,
        adminEmail: data.adminEmail,
        region: data.region,
        environment: data.environment,
        planId: data.planId,
        cloudProvider: data.cloudProvider,
        iacEngine: data.iacEngine,
        status: "CREATING",
      },
    });

    // 2. Crear DeploymentJob
    const job = await prisma.deploymentJob.create({
      data: {
        tenantId: tenant.id,
        operation: "CREATE",
        engine: data.iacEngine,
        status: "QUEUED",
      },
    });

    // 3. Iniciar despliegue asíncrono en segundo plano (sin bloquear la respuesta HTTP)
    setImmediate(() => {
      startDeploymentJob(data, job.id).catch((err) =>
        console.error(`[Orchestrator] Error en background job ${job.id}:`, err)
      );
    });

    return NextResponse.json(
      {
        message: "Aprovisionamiento de tenant iniciado con éxito",
        tenantId: tenant.id,
        jobId: job.id,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("[Tenants POST] Error:", error);
    return NextResponse.json(
      { error: "Error iniciando el despliegue del tenant" },
      { status: 500 }
    );
  }
}
