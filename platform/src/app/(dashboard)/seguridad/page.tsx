"use client";

import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Play,
  RotateCw,
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

interface ScannerLog {
  stage: string;
  stream: "stdout" | "stderr" | "system";
  message: string;
  timestamp: string;
}

interface ScannerReport {
  status: "IDLE" | "RUNNING" | "COMPLETED" | "FAILED";
  qualityGate: "PASSED" | "FAILED" | "UNKNOWN";
  startedAt?: string;
  completedAt?: string;
  totalChecks: number;
  passed: number;
  warnings: number;
  failures: number;
  tools: {
    name: string;
    status: "PASSED" | "FAILED" | "SKIPPED";
    details: string;
  }[];
  findings: {
    tool: string;
    ruleId?: string;
    severity: string;
    file: string;
    line?: number;
    message: string;
  }[];
}

export default function SeguridadPage() {
  const [logs, setLogs] = useState<ScannerLog[]>([]);
  const [report, setReport] = useState<ScannerReport | null>(null);
  const [runningTool, setRunningTool] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"warnings" | "critical" | "tools">("warnings");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Cargar estado inicial y logs previos
  useEffect(() => {
    fetch("/api/security/scan")
      .then((res) => res.json())
      .then((data) => {
        if (data.report) setReport(data.report);
        if (data.logs && Array.isArray(data.logs)) setLogs(data.logs);
      })
      .catch((err) => console.error("Error al cargar escaneos:", err));

    // Conectar al stream SSE
    const eventSource = new EventSource("/api/security/scan/stream");

    eventSource.addEventListener("log", (e) => {
      try {
        const item = JSON.parse(e.data);
        setLogs((prev) => [...prev, item]);
      } catch (err) {
        console.error("Error parseando log SSE:", err);
      }
    });

    eventSource.addEventListener("status", (e) => {
      try {
        const item = JSON.parse(e.data);
        setReport(item);
        if (item.status === "COMPLETED" || item.status === "FAILED") {
          setRunningTool(null);
        }
      } catch (err) {
        console.error("Error parseando status SSE:", err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // Auto-scroll en consola
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const handleStartScan = async (tool: string) => {
    try {
      setRunningTool(tool);
      setLogs([]);
      await fetch("/api/security/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool }),
      });
    } catch (err) {
      console.error("Error iniciando escaneo:", err);
      setRunningTool(null);
    }
  };

  const isScanning = runningTool !== null || report?.status === "RUNNING";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">DevSecOps Security & Scanners</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Quality Gate de seguridad estática: detección de secretos, validación HCL, compliance CIS y políticas como código.
          </p>
        </div>

        <button
          onClick={() => handleStartScan("all")}
          disabled={isScanning}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <RotateCw className="h-4 w-4 animate-spin" />
              Auditoría en curso...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              Ejecutar Todos los Scanners
            </>
          )}
        </button>
      </div>

      {/* Selector de Herramientas Individuales */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Escaneo puntual:</span>
        {[
          { id: "gitleaks", name: "Gitleaks (Secretos)", icon: Lock },
          { id: "tflint", name: "TFLint (HCL)", icon: FileCode },
          { id: "cfn-lint", name: "cfn-lint (CloudFormation)", icon: Layers },
          { id: "checkov", name: "Checkov (CIS Benchmark)", icon: ShieldCheck },
          { id: "pulumi", name: "Pulumi (Policy Pack)", icon: Sparkles },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => handleStartScan(t.id)}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:border-slate-300 disabled:opacity-50"
            >
              <Icon className="h-3.5 w-3.5 text-slate-500" />
              {t.name}
            </button>
          );
        })}
      </div>

      {/* Resumen del Quality Gate */}
      {report && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Quality Gate Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Quality Gate</span>
            <div className="mt-2 flex items-center gap-2">
              {report.qualityGate === "PASSED" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  SUPERADO
                </span>
              ) : report.qualityGate === "FAILED" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  FALLIDO
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  PENDIENTE
                </span>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {report.completedAt ? `Última ejecución: ${new Date(report.completedAt).toLocaleTimeString()}` : "Listo para escanear"}
            </p>
          </div>

          {/* Pruebas Aprobadas */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Verificaciones Aprobadas</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-600">{report.passed}</span>
              <span className="text-xs text-slate-400">/ {report.totalChecks} checks</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{
                  width: `${report.totalChecks > 0 ? (report.passed / report.totalChecks) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Advertencias */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Advertencias / Observaciones</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-500">{report.warnings}</span>
              <span className="text-xs text-slate-400">avisos menores</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">No bloquean el despliegue a producción</p>
          </div>

          {/* Fallos */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Fallos Críticos</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${report.failures > 0 ? "text-rose-600" : "text-slate-400"}`}>
                {report.failures}
              </span>
              <span className="text-xs text-slate-400">errores de seguridad</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {report.failures === 0 ? "Cero vulnerabilidades bloqueantes" : "Requiere corrección inmediata"}
            </p>
          </div>
        </div>
      )}

      {/* Consola de Ejecución en Vivo */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1117] shadow-xl overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#161b22] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="ml-2 font-mono text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-slate-400" />
              scanner-runner@devsecops: ~/security-audit
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {logs.length} líneas
            </span>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`rounded px-2 py-0.5 text-[11px] font-semibold transition ${
                autoScroll ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"
              }`}
            >
              Autoscroll: {autoScroll ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="h-[380px] overflow-y-auto p-4 font-mono text-xs leading-relaxed text-slate-200">
          {logs.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-500 space-y-2">
              <ShieldCheck className="h-8 w-8 text-slate-600" />
              <p>Presiona &quot;Ejecutar Todos los Scanners&quot; para iniciar la auditoría DevSecOps.</p>
            </div>
          ) : (
            logs.map((log, index) => {
              const isStderr = log.stream === "stderr";
              const isSystem = log.stream === "system";

              return (
                <div key={index} className="flex gap-2 py-0.5 hover:bg-white/5">
                  <span className="text-slate-600 select-none text-[10px]">
                    [{log.stage}]
                  </span>
                  <span
                    className={`whitespace-pre-wrap break-all ${
                      isStderr
                        ? "text-rose-400"
                        : isSystem
                        ? "text-cyan-300 font-semibold"
                        : "text-slate-200"
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Reporte Estructurado con Pestañas Segmentadas */}
      {report && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          {/* Header con Pestañas */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Reporte de Hallazgos y Cumplimiento
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Desglose clasificado de hallazgos independientes de seguridad y buenas prácticas CIS.
              </p>
            </div>

            {/* Segmented Tabs Selector */}
            {(() => {
              const warningsList = report.findings.filter(
                (f) => f.severity === "WARNING" || f.severity === "LOW" || f.severity === "MEDIUM"
              );
              const criticalsList = report.findings.filter(
                (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
              );

              return (
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200">
                  <button
                    onClick={() => setActiveTab("warnings")}
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      activeTab === "warnings"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>Avisos Menores</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        warningsList.length > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {warningsList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("critical")}
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      activeTab === "critical"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>Fallos Críticos</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        criticalsList.length > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {criticalsList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("tools")}
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      activeTab === "tools"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>Herramientas</span>
                    <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                      {report.tools.length}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Tab 1: Avisos Menores & Advertencias */}
          {activeTab === "warnings" && (
            <div className="space-y-3">
              {(() => {
                const warningsList = report.findings.filter(
                  (f) => f.severity === "WARNING" || f.severity === "LOW" || f.severity === "MEDIUM"
                );

                if (warningsList.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-slate-50 border border-slate-200">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                      <p className="text-sm font-semibold text-slate-800">Cero avisos menores detectados</p>
                      <p className="text-xs text-slate-500 mt-1">El código cumple con todas las directrices CIS informativas.</p>
                    </div>
                  );
                }

                return warningsList.map((f, i) => (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/80 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{f.tool}</span>
                        {f.ruleId && (
                          <span className="font-mono text-[11px] font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
                            {f.ruleId}
                          </span>
                        )}
                        <span className="font-bold text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                          AVISO MENOR / {f.severity}
                        </span>
                        <span className="text-slate-500 font-mono text-xs">
                          {f.file} {f.line ? `(Línea ${f.line})` : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{f.message}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* Tab 2: Fallos Críticos */}
          {activeTab === "critical" && (
            <div className="space-y-3">
              {(() => {
                const criticalsList = report.findings.filter(
                  (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
                );

                if (criticalsList.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <CheckCircle2 className="h-10 w-10 text-emerald-600 mb-2" />
                      <p className="text-sm font-bold text-emerald-900">¡Calidad de Seguridad Óptima!</p>
                      <p className="text-xs text-emerald-700 mt-1">
                        Cero fallos críticos o vulnerabilidades bloqueantes detectadas en el repositorio.
                      </p>
                    </div>
                  );
                }

                return criticalsList.map((f, i) => (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50/40"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{f.tool}</span>
                        {f.ruleId && (
                          <span className="font-mono text-[11px] font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                            {f.ruleId}
                          </span>
                        )}
                        <span className="font-bold text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded">
                          CRÍTICO
                        </span>
                        <span className="text-slate-500 font-mono text-xs">{f.file}</span>
                      </div>
                      <p className="text-xs text-rose-800 leading-relaxed font-medium">{f.message}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* Tab 3: Resumen por Herramienta */}
          {activeTab === "tools" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.tools.map((t, idx) => (
                <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">{t.name}</span>
                    {t.status === "PASSED" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" />
                        PASSED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        <XCircle className="h-3 w-3" />
                        FAILED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{t.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
