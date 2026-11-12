'use client';

import React from 'react';
import {
  Search,
  Eye,
  RefreshCw,
  ShieldCheck,
  Filter,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import {
  ActivityAction,
  ActivityLogItem,
  ActivityLogQueryParams,
} from '../types/activity-logs.types';

interface ActivityLogsTableProps {
  logs: ActivityLogItem[];
  total: number;
  page: number;
  totalPages: number;
  params: ActivityLogQueryParams;
  loading: boolean;
  onUpdateParams: (newParams: Partial<ActivityLogQueryParams>) => void;
  onRefresh: () => void;
  onSelectLog: (log: ActivityLogItem) => void;
}

export const ActivityLogsTable: React.FC<ActivityLogsTableProps> = ({
  logs,
  total,
  page,
  totalPages,
  params,
  loading,
  onUpdateParams,
  onRefresh,
  onSelectLog,
}) => {
  const getActionBadge = (action: ActivityAction) => {
    switch (action) {
      case 'UPDATE_ATTENDANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            UPDATE_ATTENDANCE
          </span>
        );
      case 'MARK_ATTENDANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            MARK_ATTENDANCE
          </span>
        );
      case 'LOGIN':
      case 'LOGOUT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            {action}
          </span>
        );
      case 'ACTIVATE_MODULE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            ACTIVATE_MODULE
          </span>
        );
      case 'IMPORT_STUDENTS':
      case 'IMPORT_SCHEDULES':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {action}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
            {action}
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const datePart = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
      const timePart = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      return `${datePart} ${timePart}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Acción */}
          <div className="relative min-w-[220px]">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={params.action || 'ALL'}
              aria-label="Filtrar por tipo de acción auditada"
              onChange={(e) =>
                onUpdateParams({ action: e.target.value as any, page: 1 })
              }
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/60 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Todas las acciones</option>
              <option value="UPDATE_ATTENDANCE">UPDATE_ATTENDANCE (Justificación / Cambio)</option>
              <option value="MARK_ATTENDANCE">MARK_ATTENDANCE (Marcación)</option>
              <option value="LOGIN">LOGIN (Inicio de sesión)</option>
              <option value="ACTIVATE_MODULE">ACTIVATE_MODULE (Activación de módulo)</option>
              <option value="IMPORT_STUDENTS">IMPORT_STUDENTS (Carga de nómina)</option>
              <option value="IMPORT_SCHEDULES">IMPORT_SCHEDULES (Carga de calendario)</option>
            </select>
          </div>

          {/* Buscador */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={params.search || ''}
              onChange={(e) => onUpdateParams({ search: e.target.value, page: 1 })}
              placeholder="Buscar por usuario o entidad..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/60 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono tabular-nums text-right">
          Total eventos: <strong className="text-slate-900">{total}</strong>
        </div>
      </div>

      {/* Tabla Densa con Sticky Header */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 whitespace-nowrap">Fecha y Hora</th>
                <th className="py-2.5 px-4">Usuario / Cédula</th>
                <th className="py-2.5 px-4 text-center">Rol</th>
                <th className="py-2.5 px-4">Acción Auditada</th>
                <th className="py-2.5 px-4">Entidad Afectada</th>
                <th className="py-2.5 px-4 text-center">Detalle / Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Cargando eventos de auditoría...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron eventos de auditoría con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/70 transition-colors h-11"
                  >
                    {/* Fecha y Hora en Monospace Tabular */}
                    <td className="py-2 px-4 whitespace-nowrap font-mono tabular-nums font-semibold text-slate-800 text-[11px]">
                      {formatDate(log.createdAt)}
                    </td>

                    {/* Usuario */}
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-800 font-semibold">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {log.userIdentifier}
                        </span>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="py-2 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {log.userRole}
                      </span>
                    </td>

                    {/* Acción */}
                    <td className="py-2 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Entidad Afectada */}
                    <td className="py-2 px-4 font-mono text-[11px] text-slate-600 truncate max-w-[160px]">
                      {log.entityAffected}
                    </td>

                    {/* Botón Inspeccionar */}
                    <td className="py-2 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-indigo-700 hover:text-indigo-900 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        title="Inspeccionar cambios Antes vs Después"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspeccionar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/60">
            <span>
              Página <strong className="font-mono tabular-nums text-slate-800">{page}</strong> de <strong className="font-mono tabular-nums text-slate-800">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateParams({ page: Math.max(page - 1, 1) })}
                disabled={page === 1}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 font-semibold disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateParams({ page: Math.min(page + 1, totalPages) })
                }
                disabled={page === totalPages}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 font-semibold disabled:opacity-40 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
