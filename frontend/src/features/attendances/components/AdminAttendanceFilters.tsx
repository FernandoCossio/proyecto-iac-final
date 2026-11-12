import React from 'react';
import { Calendar, Users, RefreshCw, Filter } from 'lucide-react';
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
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Contenedor de Selectores */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
        {/* Selector de Sesión / Fecha de Clase */}
        <div className="relative flex-1 sm:max-w-xs">
          <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={selectedDate || 'ALL'}
            onChange={(e) => onDateChange(e.target.value)}
            aria-label="Filtrar por sesión de clase"
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/70 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium"
          >
            <option value="ALL">Todas las Sesiones ({schedules.length} clases)</option>
            {schedules.map((s, idx) => (
              <option key={s.id || s.classDate} value={s.classDate}>
                Sesión {idx + 1} — {s.classDate}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Estudiante Específico */}
        <div className="relative flex-1 sm:max-w-xs">
          <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={selectedStudentId || 'ALL'}
            onChange={(e) => onStudentChange(e.target.value)}
            aria-label="Filtrar por estudiante específico"
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/70 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium"
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

      {/* Botón Refrescar Matriz */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer self-end md:self-auto"
        title="Refrescar datos de la matriz"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`}
        />
        <span>Refrescar</span>
      </button>
    </div>
  );
};
