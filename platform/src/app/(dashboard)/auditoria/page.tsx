"use client";

import { useEffect, useState, useCallback } from "react";
import {
  History,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Shield,
  Layers,
  Database,
  Lock,
  Power,
  RotateCw,
  Trash2,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  username: string;
  userRole: string;
  action: string;
  target: string;
  status: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (actionFilter !== "ALL") params.set("action", actionFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Error al cargar auditoría:", err);
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCsv = () => {
    window.location.href = `/api/audit?format=csv${actionFilter !== "ALL" ? `&action=${actionFilter}` : ""}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`;
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "TENANT_CREATE":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            <Layers className="h-3 w-3" /> Crear Tenant
          </span>
        );
      case "TENANT_SUSPEND":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <Power className="h-3 w-3" /> Suspender
          </span>
        );
      case "TENANT_RESUME":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <RotateCw className="h-3 w-3" /> Reanudar
          </span>
        );
      case "TENANT_DESTROY":
      case "TENANT_PURGE":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
            <Trash2 className="h-3 w-3" /> Destruir
          </span>
        );
      case "TENANT_BACKUP":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
            <Database className="h-3 w-3" /> Respaldo BD
          </span>
        );
      case "SECURITY_SCAN":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
            <Shield className="h-3 w-3" /> Auditoría Scanners
          </span>
        );
      case "AUTH_LOGIN":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            <Lock className="h-3 w-3" /> Inicio de Sesión
          </span>
        );
      case "AUTH_LOGOUT":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            <Lock className="h-3 w-3" /> Cierre de Sesión
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <History className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Bitácora de Auditoría (Audit Log)</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Registro histórico de trazabilidad de operaciones, identidad de ejecución y resultados del sistema (RF-20).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Exportar CSV
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refrescar
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por usuario, recurso o detalle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">Todas las Acciones</option>
            <option value="TENANT_CREATE">Crear Tenant</option>
            <option value="TENANT_SUSPEND">Suspender Tenant</option>
            <option value="TENANT_RESUME">Reanudar Tenant</option>
            <option value="TENANT_DESTROY">Destruir Tenant</option>
            <option value="TENANT_BACKUP">Respaldo BD</option>
            <option value="SECURITY_SCAN">Auditoría Scanners</option>
            <option value="AUTH_LOGIN">Inicio de Sesión</option>
            <option value="AUTH_LOGOUT">Cierre de Sesión</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="SUCCESS">Exitoso (SUCCESS)</option>
            <option value="FAILED">Fallido (FAILED)</option>
            <option value="WARNING">Advertencia (WARNING)</option>
          </select>
        </div>
      </div>

      {/* Tabla de Eventos */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Fecha y Hora</th>
                <th className="px-6 py-3.5">Usuario</th>
                <th className="px-6 py-3.5">Acción</th>
                <th className="px-6 py-3.5">Recurso / Target</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5">Detalles de Operación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-5 w-5 animate-spin text-brand-600 mb-2" />
                    Cargando bitácora de auditoría...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron registros de auditoría coincidentes.
                  </td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    {/* Fecha */}
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>

                    {/* Usuario */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                          {item.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none">{item.username}</p>
                          <span className="text-[10px] text-slate-400 uppercase">{item.userRole}</span>
                        </div>
                      </div>
                    </td>

                    {/* Acción */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(item.action)}
                    </td>

                    {/* Recurso */}
                    <td className="px-6 py-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {item.target}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Éxito
                        </span>
                      ) : item.status === "FAILED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                          <XCircle className="h-3 w-3" />
                          Fallo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                          <AlertTriangle className="h-3 w-3" />
                          Aviso
                        </span>
                      )}
                    </td>

                    {/* Detalles */}
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={item.details || ""}>
                      {item.details || <span className="text-slate-400 italic">Sin detalles adicionales</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer con Contador */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-xs text-slate-500">
          <span>Mostrando <strong>{logs.length}</strong> de <strong>{total}</strong> eventos auditados</span>
          <span className="font-mono text-[11px] text-slate-400">Cumplimiento RF-20 Activo</span>
        </div>
      </div>
    </div>
  );
}
