'use client';

import React from 'react';
import { useStudentAuth } from '@/features/auth/hooks/useStudentAuth';
import { useStudentHistory } from '@/features/attendances/hooks/useStudentHistory';
import { AttendanceSummaryCards } from '@/features/attendances/components/AttendanceSummaryCards';
import { AttendanceHistoryTable } from '@/features/attendances/components/AttendanceHistoryTable';
import {
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function HistorialPage() {
  const { student } = useStudentAuth();
  const { data, isLoading, isRefreshing, error, refreshHistory } =
    useStudentHistory();

  const moduleName = student?.module?.name || 'Módulo Académico';

  return (
    <div className="space-y-6">
      {/* 1. Cabecera Institucional Limpia (Sin componentes redundantes de código de módulo) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Historial de Asistencias
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {moduleName}
          </p>
        </div>

        {/* Botón de Refresco Manual */}
        <button
          onClick={() => refreshHistory()}
          disabled={isLoading || isRefreshing}
          aria-label="Actualizar datos del historial"
          className="self-start sm:self-auto inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-2xs transition disabled:opacity-50 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 active:scale-[0.98]"
        >
          <RefreshCw
            className={`w-4 h-4 text-emerald-700 ${
              isRefreshing || (isLoading && !data) ? 'animate-spin' : ''
            }`}
          />
          <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
        </button>
      </div>

      {/* 2. Mensaje de Error en caso de falla de API */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3 shadow-xs"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block mb-0.5">
              Error al consultar el historial
            </strong>
            <span>{error}</span>
          </div>
          <button
            onClick={() => refreshHistory()}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 underline shrink-0 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* 3. Estado de Carga Inicial */}
      {isLoading && !data ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
          <p className="text-xs sm:text-sm font-medium text-slate-600">
            Cargando historial de asistencias y balance académico...
          </p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Tarjetas de Resumen de 5 KPIs */}
          <AttendanceSummaryCards summary={data.summary} />

          {/* Tabla / Timeline Cronológico con Filtros Rápidos */}
          <AttendanceHistoryTable
            sessions={data.sessions}
            isLoading={isRefreshing}
          />
        </div>
      ) : null}
    </div>
  );
}
