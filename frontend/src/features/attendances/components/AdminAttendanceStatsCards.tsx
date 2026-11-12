import React from 'react';
import {
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { MatrixSummaryMetrics } from '../types/admin-attendance.types';

interface AdminAttendanceStatsCardsProps {
  summary: MatrixSummaryMetrics;
}

export const AdminAttendanceStatsCards: React.FC<
  AdminAttendanceStatsCardsProps
> = ({ summary }) => {
  const getPercentageColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-700';
    if (pct >= 70) return 'text-amber-700';
    return 'text-rose-700';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. % Asistencia */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tasa Asistencia
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <span
            className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight ${getPercentageColor(
              summary.attendancePercentage,
            )}`}
          >
            {summary.attendancePercentage.toFixed(1)}%
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500 truncate">
          Promedio de regularidad
        </div>
      </div>

      {/* 2. Total Presentes */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Presentes
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
            {summary.totalPresent}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-emerald-700 font-medium truncate">
          Marcas puntuales
        </div>
      </div>

      {/* 3. Total Ausentes */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Inasistencias
          </span>
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-100">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
            {summary.totalAbsent}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-rose-700 font-medium truncate">
          Faltas computadas
        </div>
      </div>

      {/* 4. Total Estudiantes */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Matriculados
          </span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
            {summary.totalStudents}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500 truncate">
          Nómina oficial activa
        </div>
      </div>

      {/* 5. Total Sesiones */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Clases
          </span>
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
            {summary.totalClasses}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500 truncate">
          Cronograma del curso
        </div>
      </div>
    </div>
  );
};
