import { NextResponse } from "next/server";

export async function GET() {
  const checkService = async (url: string, timeoutMs = 2500): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
      clearTimeout(id);
      return res.ok;
    } catch {
      return false;
    }
  };

  const [grafanaOk, prometheusOk] = await Promise.all([
    checkService("http://localhost:3002/api/health"),
    checkService("http://localhost:9090/-/healthy"),
  ]);

  return NextResponse.json({
    grafana: grafanaOk ? "online" : "offline",
    prometheus: prometheusOk ? "online" : "offline",
    nodeExporter: prometheusOk ? "online" : "offline",
    timestamp: new Date().toISOString(),
  });
}
