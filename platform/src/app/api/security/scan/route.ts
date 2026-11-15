import { NextResponse } from "next/server";
import { executeScanners, getLatestReport, getScanLogsHistory } from "@/lib/orchestrator/scanner-runner";

export async function GET() {
  return NextResponse.json({
    report: getLatestReport(),
    logs: getScanLogsHistory(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const tool = body.tool || "all";

    setImmediate(() => {
      executeScanners(tool).catch((err) =>
        console.error("[ScannerRunner] Error ejecutando scanners:", err)
      );
    });

    return NextResponse.json(
      { message: `Auditoría de seguridad iniciada (${tool})` },
      { status: 202 }
    );
  } catch (error) {
    console.error("[Security Scan POST] Error:", error);
    return NextResponse.json(
      { error: "Error iniciando escaneo de seguridad" },
      { status: 500 }
    );
  }
}
