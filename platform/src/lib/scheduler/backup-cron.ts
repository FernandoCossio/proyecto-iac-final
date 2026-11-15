import { prisma } from "../prisma";
import { runTenantBackup } from "../orchestrator/runner";
import { logAuditEvent } from "../audit/audit-logger";

let isSchedulerRunning = false;
let intervalHandle: NodeJS.Timeout | null = null;
let lastAutomaticRun: string | null = null;

/**
 * Ejecuta el respaldo automático para todos los tenants que se encuentren en estado ACTIVO.
 */
export async function runAutomaticBackupsForAllActiveTenants(): Promise<{
  total: number;
  successCount: number;
  results: { tenantId: string; success: boolean; error?: string }[];
}> {
  console.log("[BackupScheduler] Iniciando ciclo automático de respaldos...");
  lastAutomaticRun = new Date().toISOString();

  const activeTenants = await prisma.tenant.findMany({
    where: { status: "ACTIVE" },
  });

  const results: { tenantId: string; success: boolean; error?: string }[] = [];
  let successCount = 0;

  for (const tenant of activeTenants) {
    try {
      console.log(`[BackupScheduler] Respaldando tenant: ${tenant.id}`);
      const res = await runTenantBackup(tenant.id);
      if (res.success) {
        successCount++;
        results.push({ tenantId: tenant.id, success: true });
        logAuditEvent({
          username: "Sistema (Scheduler)",
          userRole: "SYSTEM",
          action: "TENANT_BACKUP",
          target: `Tenant: ${tenant.id}`,
          status: "SUCCESS",
          details: `Respaldo automático periódico generado: ${res.filename}`,
        });
      } else {
        results.push({ tenantId: tenant.id, success: false, error: res.error });
        logAuditEvent({
          username: "Sistema (Scheduler)",
          userRole: "SYSTEM",
          action: "TENANT_BACKUP",
          target: `Tenant: ${tenant.id}`,
          status: "FAILED",
          details: `Fallo en respaldo automático periódico: ${res.error}`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ tenantId: tenant.id, success: false, error: msg });
    }
  }

  console.log(`[BackupScheduler] Ciclo completado: ${successCount}/${activeTenants.length} exitosos.`);
  return { total: activeTenants.length, successCount, results };
}

/**
 * Inicializa el temporizador de respaldos automáticos (por defecto cada 24 horas).
 */
export function startBackupScheduler(intervalMs = 24 * 60 * 60 * 1000): void {
  if (isSchedulerRunning) return;
  isSchedulerRunning = true;

  console.log(`[BackupScheduler] Planificador de respaldos automáticos iniciado (intervalo: ${intervalMs / 3600000}h)`);
  
  // Programar ejecución periódica
  intervalHandle = setInterval(() => {
    runAutomaticBackupsForAllActiveTenants().catch((err) =>
      console.error("[BackupScheduler] Error en ejecución periódica:", err)
    );
  }, intervalMs);
}

export function getSchedulerStatus() {
  return {
    isRunning: isSchedulerRunning,
    lastRun: lastAutomaticRun,
    retentionPolicy: "Últimas 7 copias por tenant",
    intervalHours: 24,
  };
}
