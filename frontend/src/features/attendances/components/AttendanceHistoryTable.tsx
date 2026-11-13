'use client';

import React, { useState, useMemo } from 'react';
import { ClassSessionHistoryItem } from '../types/attendance.types';
import { formatDate } from '../../../lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Clock,
  FileCheck2,
  Filter,
} from 'lucide-react';

export interface AttendanceHistoryTableProps {
  sessions: ClassSessionHistoryItem[];
  isLoading?: boolean;
  className?: string;
}

type FilterStatus = 'ALL' | 'PRESENTE' | 'FALTA' | 'JUSTIFICADO' | 'PROGRAMADA';

export function AttendanceHistoryTable({
  sessions,
  isLoading = false,
  className = '',
}: AttendanceHistoryTableProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('ALL');

  const formatTime = (timeString?: string | Date | null) => {
    if (!timeString) return '—';
    if (typeof timeString === 'string' && timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
    return String(timeString);
  };

  const normalizeStatus = (status: string) => {
    if (status === 'PENDIENTE_HOY' || status === 'PROGRAMADA') {
      return 'PENDIENTE';
    }
    return status.toUpperCase();
  };

  // Conteos para los filtros
  const counts = useMemo(() => {
    return {
      all: sessions.length,
      presente: sessions.filter((s) => s.status === 'PRESENTE').length,
      falta: sessions.filter((s) => s.status === 'FALTA').length,
      justificado: sessions.filter((s) => s.status === 'JUSTIFICADO').length,
      programada: sessions.filter(
        (s) => s.status === 'PROGRAMADA' || s.status === 'PENDIENTE_HOY'
      ).length,
    };
  }, [sessions]);

  // Lista filtrada
  const filteredSessions = useMemo(() => {
    if (selectedFilter === 'ALL') return sessions;
    if (selectedFilter === 'PROGRAMADA') {
      return sessions.filter(
        (s) => s.status === 'PROGRAMADA' || s.status === 'PENDIENTE_HOY'
      );
    }
    return sessions.filter((s) => s.status === selectedFilter);
  }, [sessions, selectedFilter]);

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${className}`}
    >
      {/* 1. Cabecera del Panel de Historial */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Cronograma y Bitácora de Asistencia
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {filteredSessions.length} de {sessions.length}{' '}
              {sessions.length === 1 ? 'sesión' : 'sesiones'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro cronológico inmutable. Las clases concluidas sin marcación se computan como inasistencia.
          </p>
        </div>

        {/* 2. Barra de Filtros Rápidos por Estado (Inspirado en la Matriz de Admin) */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setSelectedFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${
              selectedFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            Todas ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('PRESENTE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${
              selectedFilter === 'PRESENTE'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Asistidas ({counts.presente})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('FALTA')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${
              selectedFilter === 'FALTA'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Inasistencias ({counts.falta})
          </button>

          {counts.justificado > 0 && (
            <button
              type="button"
              onClick={() => setSelectedFilter('JUSTIFICADO')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${
                selectedFilter === 'JUSTIFICADO'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              Justificadas ({counts.justificado})
            </button>
          )}

          {counts.programada > 0 && (
            <button
              type="button"
              onClick={() => setSelectedFilter('PROGRAMADA')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${
                selectedFilter === 'PROGRAMADA'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pendientes ({counts.programada})
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Cargando cronograma académico...
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">
          No hay sesiones programadas en este módulo académico.
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">
          No hay sesiones que coincidan con el filtro seleccionado.
        </div>
      ) : (
        <>
          {/* VISTA 1: ESCRITORIO (≥ 768px) - TABLA DE ALTA DENSIDAD CON CABECERA FIJA */}
          <div className="hidden md:block overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 w-14 text-center"># Ses</th>
                  <th className="py-2.5 px-4">Fecha de Clase</th>
                  <th className="py-2.5 px-4">Horario</th>
                  <th className="py-2.5 px-4">Estado</th>
                  <th className="py-2.5 px-4">Hora de Marcación</th>
                  <th className="py-2.5 px-4">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((session, index) => {
                  const originalIndex = sessions.findIndex((s) => s.id === session.id);
                  const sessionIndex = originalIndex >= 0 ? originalIndex : index;
                  const sessionNumber = String(sessionIndex + 1).padStart(2, '0');
                  const statusKey = normalizeStatus(session.status);

                  return (
                    <tr
                      key={session.id || sessionIndex}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-500">
                        {sessionNumber}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900 font-mono tabular-nums">
                        {formatDate(session.classDate)}
                      </td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600">
                        {session.startTime} - {session.endTime}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={statusKey} size="sm" />
                      </td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700">
                        {formatTime(session.markedAt)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px] truncate max-w-xs">
                        {session.remarks || (session.status === 'PRESENTE' ? 'Puntual' : '—')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* VISTA 2: SMARTPHONES (< 768px) - TIMELINE VERTICAL DE TARJETAS TÁCTILES (0 SCROLL-X) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredSessions.map((session, index) => {
              const originalIndex = sessions.findIndex((s) => s.id === session.id);
              const sessionIndex = originalIndex >= 0 ? originalIndex : index;
              const sessionNumber = String(sessionIndex + 1).padStart(2, '0');
              const statusKey = normalizeStatus(session.status);

              return (
                <article
                  key={session.id || sessionIndex}
                  className="p-4 space-y-2 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        Sesión {sessionNumber}
                      </span>
                      <span className="font-semibold text-xs text-slate-900 font-mono tabular-nums">
                        {formatDate(session.classDate)}
                      </span>
                    </div>
                    <StatusBadge status={statusKey} size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                    <div className="flex items-center gap-1.5 font-mono tabular-nums text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {session.startTime} a {session.endTime}
                      </span>
                    </div>

                    <div className="font-mono tabular-nums text-[11px] text-slate-500">
                      {session.markedAt ? (
                        <span className="text-emerald-700 font-medium">
                          Marcado: {formatTime(session.markedAt)}
                        </span>
                      ) : (
                        <span>Sin registro</span>
                      )}
                    </div>
                  </div>

                  {session.remarks && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{session.remarks}</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
