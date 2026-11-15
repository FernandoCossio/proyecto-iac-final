import { NextResponse } from "next/server";
import {
  getSchedulerStatus,
  runAutomaticBackupsForAllActiveTenants,
  startBackupScheduler,
} from "@/lib/scheduler/backup-cron";

export async function GET() {
  // Asegurar que el scheduler esté inicializado
  startBackupScheduler();
  return NextResponse.json(getSchedulerStatus());
}

export async function POST() {
  try {
    const result = await runAutomaticBackupsForAllActiveTenants();
    return NextResponse.json({
      message: "Ciclo automático de respaldos ejecutado",
      ...result,
    });
  } catch (error) {
    console.error("[Backup Schedule POST] Error:", error);
    return NextResponse.json({ error: "Error ejecutando ciclo de respaldos" }, { status: 500 });
  }
}
