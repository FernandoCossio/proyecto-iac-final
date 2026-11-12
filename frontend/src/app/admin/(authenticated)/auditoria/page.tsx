'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useActivityLogs } from '@/features/activity-logs/hooks/useActivityLogs';
import { ActivityLogsTable } from '@/features/activity-logs/components/ActivityLogsTable';
import { ActivityLogDetailModal } from '@/features/activity-logs/components/ActivityLogDetailModal';
import { ActivityLogItem } from '@/features/activity-logs/types/activity-logs.types';

export default function AdminAuditoriaPage() {
  const {
    logs,
    total,
    page,
    totalPages,
    params,
    loading,
    error,
    updateParams,
    refresh,
  } = useActivityLogs();

  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInspect = (log: ActivityLogItem) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Institucional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Bitácora de Auditoría del Sistema</span>
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Inmutable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro cronológico detallado de modificaciones de asistencias, activaciones de módulos y accesos administrativos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs shadow-2xs">
            <span className="text-slate-500">Total eventos:</span>
            <span className="font-mono tabular-nums font-bold text-slate-900">
              {total}
            </span>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
            title="Refrescar registros de auditoría"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`}
            />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Mensaje de Error si ocurre */}
      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-2xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Tabla Densa de Auditoría */}
      <ActivityLogsTable
        logs={logs}
        total={total}
        page={page}
        totalPages={totalPages}
        params={params}
        loading={loading}
        onUpdateParams={updateParams}
        onRefresh={refresh}
        onSelectLog={handleInspect}
      />

      {/* Modal de Detalle e Inspección Antes vs Después */}
      <ActivityLogDetailModal
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
