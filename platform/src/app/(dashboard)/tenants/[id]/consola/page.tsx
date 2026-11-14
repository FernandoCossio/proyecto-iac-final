"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Terminal,
  ArrowLeft,
  Copy,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Trash2,
  Check,
} from "lucide-react";

interface LogEntry {
  stage: string;
  stream: string;
  message: string;
  timestamp: string;
}

export default function TenantConsolaPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<string>("CREATING");
  const [frontendIp, setFrontendIp] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string>(tenantId);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [filterStage, setFilterStage] = useState<string>("ALL");
  const [copied, setCopied] = useState<boolean>(false);
  const [cleaning, setCleaning] = useState<boolean>(false);
  const [retrying, setRetrying] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await fetch(`/api/tenants/${tenantId}/retry`, { method: "POST" });
      setStatus("CREATING");
    } catch (err) {
      console.error("Error reintentando despliegue:", err);
    } finally {
      setRetrying(false);
    }
  };

  // Fetch initial tenant details
  useEffect(() => {
    fetch(`/api/tenants/${tenantId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.tenant) {
          setTenantName(data.tenant.name);
          setStatus(data.tenant.status);
          if (data.tenant.frontendPublicIp) {
            setFrontendIp(data.tenant.frontendPublicIp);
          }
        }
      })
      .catch((err) => console.error("Error fetching tenant detail:", err));
  }, [tenantId]);

  // Connect to SSE stream
  useEffect(() => {
    const eventSource = new EventSource(`/api/tenants/${tenantId}/logs/stream`);

    eventSource.addEventListener("log", (e) => {
      try {
        const entry: LogEntry = JSON.parse(e.data);
        setLogs((prev) => [...prev, entry]);
      } catch (err) {
        console.error("Error parsing log entry:", err);
      }
    });

    eventSource.addEventListener("status", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.status) setStatus(data.status);
      } catch (err) {
        console.error("Error parsing status update:", err);
      }
    });

    eventSource.addEventListener("ips", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.frontendPublicIp) setFrontendIp(data.frontendPublicIp);
      } catch (err) {
        console.error("Error parsing ips update:", err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [tenantId]);

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const copyToClipboard = () => {
    const fullText = logs.map((l) => `[${l.stage}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLogFile = () => {
    const fullText = logs.map((l) => `[${l.stage}][${l.timestamp}] ${l.message}`).join("\n");
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `despliegue-${tenantId}-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCleanResources = async () => {
    if (!confirm(`¿Eliminar y limpiar los recursos cloud creados para '${tenantId}'?`)) return;
    setCleaning(true);
    try {
      await fetch(`/api/tenants/${tenantId}`, { method: "DELETE" });
      setStatus("TERMINATING");
    } catch (err) {
      console.error("Error destruyendo recursos:", err);
    } finally {
      setCleaning(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterStage === "ALL") return true;
    if (filterStage === "IAC") return log.stage.startsWith("IAC");
    if (filterStage === "ANSIBLE") return log.stage === "ANSIBLE";
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl pb-16">
      {/* Top Bar with Back Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/tenants"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
            title="Volver a lista de tenants"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Consola en Vivo: {tenantName}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800"
                    : status === "FAILED"
                    ? "bg-red-100 text-red-800"
                    : status === "SUSPENDED"
                    ? "bg-amber-100 text-amber-800"
                    : status === "TERMINATING"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800 animate-pulse"
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              ID: {tenantId} • Stream de eventos SSE en tiempo real
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {frontendIp && status === "ACTIVE" && (
            <a
              href={`http://${frontendIp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir Portal ({frontendIp})
            </a>
          )}

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </button>

          <button
            onClick={downloadLogFile}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar .log
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {status === "ACTIVE" && frontendIp && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-emerald-900">
                ¡Tenant aprovisionado y certificado con éxito!
              </p>
              <p className="text-xs text-emerald-700">
                Las 3 capas (Frontend Nginx/Next.js, Backend NestJS, PostgreSQL 16) están respondiendo en HTTP 200.
              </p>
            </div>
          </div>
          <a
            href={`http://${frontendIp}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
          >
            Ingresar al Workload →
          </a>
        </div>
      )}

      {/* Failure Notification Banner */}
      {status === "FAILED" && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <p className="text-sm font-bold text-red-900">
                El proceso de aprovisionamiento se detuvo por un error.
              </p>
              <p className="text-xs text-red-700">
                Revisa los mensajes resaltados en rojo en la consola para identificar la causa.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <RotateCw className={`h-3.5 w-3.5 ${retrying ? "animate-spin" : ""}`} />
              {retrying ? "Reintentando..." : "Reintentar"}
            </button>
            <button
              onClick={handleCleanResources}
              disabled={cleaning}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpiar Recursos ($0 Costo)
            </button>
          </div>
        </div>
      )}

      {/* Terminal View Container */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-[#0c1222] shadow-2xl">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 py-3">
          <div className="flex items-center gap-3">
            {/* macOS styled window buttons */}
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 pl-2 text-xs font-mono text-slate-400">
              <Terminal className="h-3.5 w-3.5 text-brand-400" />
              <span>deployment-runner@orchestrator: ~/{tenantId}</span>
            </div>
          </div>

          {/* Filters and AutoScroll */}
          <div className="flex items-center gap-3 text-xs">
            {/* Filter Buttons */}
            <div className="flex rounded-md bg-slate-800 p-0.5">
              <button
                onClick={() => setFilterStage("ALL")}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                  filterStage === "ALL" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Todo ({logs.length})
              </button>
              <button
                onClick={() => setFilterStage("IAC")}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                  filterStage === "IAC" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                IaC
              </button>
              <button
                onClick={() => setFilterStage("ANSIBLE")}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                  filterStage === "ANSIBLE" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Ansible
              </button>
            </div>

            {/* Autoscroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                autoScroll ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
              }`}
            >
              <Play className={`h-3 w-3 ${autoScroll ? "animate-pulse" : ""}`} />
              Autoscroll: {autoScroll ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="h-[550px] overflow-y-auto p-4 font-mono text-xs leading-relaxed text-slate-300">
          {filteredLogs.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-500">
              <Terminal className="h-10 w-10 text-slate-700 animate-pulse" />
              <p className="mt-3 text-sm">Esperando inicio del proceso de aprovisionamiento...</p>
              <p className="text-xs text-slate-600">Las líneas de log aparecerán en tiempo real vía SSE.</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const isWarning =
                log.message.includes("[WARNING]") ||
                log.message.includes("[DEPRECATION WARNING]") ||
                log.message.toLowerCase().includes("warning");
              const isError =
                !isWarning &&
                (log.stream === "stderr" ||
                  log.message.includes("✖") ||
                  log.message.includes("FAILED") ||
                  log.message.includes("Error:") ||
                  log.message.includes("failed="));
              const isSuccess =
                log.message.includes("✔") ||
                log.message.includes("ok=") ||
                log.message.includes("Apply complete");
              const isChanged = log.message.includes("changed=");
              const isSystem = log.stream === "system" || log.message.startsWith("▶");

              return (
                <div
                  key={index}
                  className={`flex items-start gap-2 py-0.5 ${
                    isError
                      ? "text-red-400 bg-red-950/20 px-1 rounded"
                      : isWarning
                      ? "text-amber-400 bg-amber-950/20 px-1 rounded"
                      : isSuccess
                      ? "text-emerald-400"
                      : isChanged
                      ? "text-yellow-400"
                      : isSystem
                      ? "text-cyan-300 font-semibold"
                      : "text-slate-300"
                  }`}
                >
                  <span className="shrink-0 text-[10px] text-slate-600 select-none">
                    [{log.stage}]
                  </span>
                  <span className="break-all whitespace-pre-wrap">{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
