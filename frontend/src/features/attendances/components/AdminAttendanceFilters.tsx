import React from 'react';
import { Calendar, Search, Users, RefreshCw } from 'lucide-react';
import {
  MatrixScheduleItem,
  MatrixStudentItem,
} from '../types/admin-attendance.types';

interface AdminAttendanceFiltersProps {
  schedules: MatrixScheduleItem[];
  students: MatrixStudentItem[];
  selectedDate: string;
  selectedStudentId: string;
  onDateChange: (date: string) => void;
  onStudentChange: (studentId: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const AdminAttendanceFilters: React.FC<AdminAttendanceFiltersProps> = ({
  schedules,
  students,
  selectedDate,
  selectedStudentId,
  onDateChange,
  onStudentChange,
  onRefresh,
  loading,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3.5">
      {/* 1. Selector Horizontal de Sesiones / Fechas */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            Jornadas y Sesiones de Clase:
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            {schedules.length} clases programadas
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => onDateChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedDate === 'ALL' || !selectedDate
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Todas las Sesiones
          </button>

          {schedules.map((s, idx) => {
            const isSelected = selectedDate === s.classDate;
            return (
              <button
                key={s.id || s.classDate}
                type="button"
                onClick={() => onDateChange(s.classDate)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="font-mono">Sesión {idx + 1}</span>
                <span className="text-[10px] opacity-80 font-mono">({s.classDate})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Filtros Secundarios y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Selector de Estudiante Específico */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedStudentId || 'ALL'}
              onChange={(e) => onStudentChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/70 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Todos los Alumnos ({students.length})</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.registrationNumber} — {st.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón Refrescar */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors disabled:opacity-50"
          title="Refrescar datos de la matriz"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`}
          />
          <span>Refrescar</span>
        </button>
      </div>
    </div>
  );
};
