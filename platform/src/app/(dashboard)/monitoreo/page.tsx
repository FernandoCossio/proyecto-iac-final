"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ExternalLink,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Bell,
  Cpu,
  Layers,
} from "lucide-react";

interface ServiceStatus {
  grafana: "online" | "offline";
  prometheus: "online" | "offline";
  nodeExporter: "online" | "offline";
  timestamp: string;
}

export default function MonitoreoPage() {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showIframe, setShowIframe] = useState<boolean>(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/monitoring/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Error fetching monitoring status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const grafanaUrl = "http://localhost:3002/d/tenants-de-asistencias/tenants-de-asistencias";
  const prometheusUrl = "http://localhost:9090";
  const prometheusAlertsUrl = "http://localhost:9090/alerts";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <Activity className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Hub de Monitoreo & Observabilidad</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Supervisión continua de infraestructura multitenant, métricas de rendimiento y alertas en tiempo real.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refrescar estado
        </button>
      </div>

      {/* Tarjetas Principales de Servicios */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Tarjeta Grafana */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-200 hover:shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Grafana</h3>
                  <p className="text-xs text-slate-500">Puerto 3002 · Dashboards</p>
                </div>
              </div>

              {status?.grafana === "online" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  En Línea
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
                  <XCircle className="h-3.5 w-3.5" />
                  No disponible
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Dashboard activo <strong>Tenants de asistencias</strong>. Visualiza uso de CPU, memoria, almacenamiento, tráfico de red y estado de salud individual.
            </p>

            <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Usuario / Contraseña:</span>
                <span className="font-mono font-medium">admin / admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Visor anónimo:</span>
                <span className="font-medium text-emerald-600">Habilitado</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <a
              href={grafanaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir Dashboard de Tenants
            </a>

            <button
              onClick={() => setShowIframe(!showIframe)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              {showIframe ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                  Ocultar Visor Embebido
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                  Ver Embebido en la Plataforma
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tarjeta Prometheus */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-red-200 hover:shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Server className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Prometheus</h3>
                  <p className="text-xs text-slate-500">Puerto 9090 · Time-Series TSDB</p>
                </div>
              </div>

              {status?.prometheus === "online" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  En Línea
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
                  <XCircle className="h-3.5 w-3.5" />
                  No disponible
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Motor de recolección de métricas cada 15 segundos con <strong>File Service Discovery</strong> dinámico sincronizado con los tenants aprovisionados.
            </p>

            <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Scrape Interval:</span>
                <span className="font-mono font-medium">15s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ruta de targets:</span>
                <span className="font-mono">iac/monitoring/targets/</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <a
              href={prometheusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Consola Prometheus
            </a>
            <a
              href={`${prometheusUrl}/targets`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Layers className="h-3.5 w-3.5 text-slate-500" />
              Ver Targets Activos
            </a>
          </div>
        </div>

        {/* Tarjeta Alertas DevSecOps */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Alertas de Salud</h3>
                  <p className="text-xs text-slate-500">Reglas Prometheus & Grafana</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Reglas Activas
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Supervisión de salud según los criterios de aceptación: alertas automáticas ante fallos de nodo o saturación de capacidad.
            </p>

            <div className="space-y-2 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    HostDown
                  </span>
                  <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-mono font-bold">CRITICAL</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Instancia sin responder por más de 1 minuto (up == 0).</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-amber-500" />
                    HighCpuUsage
                  </span>
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-mono font-bold">WARNING</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Uso de CPU sostenido superior al 85% por más de 2 minutos.</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <a
              href={prometheusAlertsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Consultar Panel de Alertas en Vivo
            </a>
          </div>
        </div>
      </div>

      {/* Visor Embebido Iframe de Grafana */}
      {showIframe && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-600" />
              <h3 className="text-sm font-bold text-slate-900">Tablero Integrado de Grafana</h3>
              <span className="text-xs text-slate-500">(Kiosk Mode)</span>
            </div>
            <button
              onClick={() => setShowIframe(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Cerrar visor
            </button>
          </div>
          <div className="relative w-full h-[650px] overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
            <iframe
              src={`${grafanaUrl}?kiosk=tv&refresh=10s`}
              className="w-full h-full border-0"
              title="Grafana Dashboard"
            />
          </div>
        </div>
      )}
    </div>
  );
}
