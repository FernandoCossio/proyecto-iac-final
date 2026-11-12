'use client';

import React, { useEffect, useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StudentItem } from '../types/student.types';
import { AdminAttendanceService } from '@/features/attendances/services/admin-attendance.service';
import { MatrixRowItem } from '@/features/attendances/types/admin-attendance.types';
import {
  Users,
  Mail,
  Calendar,
  Clock,
  Loader2,
} from 'lucide-react';

export interface StudentDossierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentItem | null;
}

export const StudentDossierDrawer: React.FC<StudentDossierDrawerProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const [sessions, setSessions] = useState<MatrixRowItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!student || !isOpen) {
      setSessions([]);
      return;
    }

    setIsLoading(true);
    AdminAttendanceService.getMatrix({ studentId: student.id })
      .then((matrix) => {
        if (matrix?.rows) {
          setSessions(matrix.rows);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [student, isOpen]);

  if (!student) return null;

  const presentCount = sessions.filter(
    (s) => s.status === 'PRESENTE' || s.status === 'JUSTIFICADO',
  ).length;
  const absentCount = sessions.filter((s) => s.status === 'FALTA').length;
  const pct = sessions.length > 0
    ? (presentCount / sessions.length) * 100
    : 85;

  let regularityStatus = 'REGULAR';
  if (pct < 70) regularityStatus = 'REPROBADO';
  else if (pct < 80) regularityStatus = 'EN_RIESGO';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Expediente de Asistencias"
      subtitle={`Historial sesión a sesión — CI: ${student.registrationNumber}`}
      width="lg"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cerrar Expediente
        </button>
      }
    >
      <div className="space-y-6">
        {/* Ficha Principal del Estudiante */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 font-mono shadow-xs">
              {student.fullName
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {student.fullName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
                <span>CI: {student.registrationNumber}</span>
                <span>•</span>
                <span className="flex items-center gap-1 truncate text-slate-600">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {student.email}
                </span>
              </div>
            </div>
          </div>

          {/* Resumen Cuantitativo de Regularidad */}
          <div className="pt-3 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Regularidad
              </span>
              <span className="text-base font-extrabold font-mono tabular-nums text-indigo-700">
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Presentes
              </span>
              <span className="text-base font-extrabold font-mono tabular-nums text-emerald-700">
                {presentCount}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Inasistencias
              </span>
              <span className="text-base font-extrabold font-mono tabular-nums text-rose-700">
                {absentCount}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">Condición Académica:</span>
            <StatusBadge status={regularityStatus} size="sm" />
          </div>
        </div>

        {/* Historial Sesión a Sesión */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Sesiones Registradas ({sessions.length})
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Cargando sesiones del alumno...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
              No hay sesiones computadas para este estudiante en el módulo activo.
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden bg-white">
              {sessions.map((ses, idx) => (
                <div
                  key={`${ses.classScheduleId}_${idx}`}
                  className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-mono text-[11px] font-bold text-slate-400">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <div>
                      <div className="font-mono tabular-nums font-semibold text-slate-900">
                        {ses.classDate}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {ses.timeRange || '08:30 - 12:30'}
                        {ses.markedAt && (
                          <span className="ml-1 text-slate-400">
                            • Marcó {new Date(ses.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ses.remarks && (
                      <span
                        className="hidden sm:inline-block text-[11px] text-slate-500 italic max-w-[140px] truncate"
                        title={ses.remarks}
                      >
                        {ses.remarks}
                      </span>
                    )}
                    <StatusBadge status={ses.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
