'use client';

import React, { useMemo } from 'react';
import { Calendar, Users, RefreshCw } from 'lucide-react';
import { Select, SelectOption } from '@/components/ui/Select';
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
  // Opciones de sesiones de clase
  const sessionOptions = useMemo<SelectOption[]>(() => {
    const list: SelectOption[] = [
      {
        value: 'ALL',
        label: `Todas las Sesiones (${schedules.length} clases)`,
      },
    ];

    schedules.forEach((s, idx) => {
      list.push({
        value: s.classDate,
        label: `Sesión ${idx + 1} — ${s.classDate}`,
        badge: s.startTime && s.endTime ? `${s.startTime} - ${s.endTime}` : undefined,
      });
    });

    return list;
  }, [schedules]);

  // Opciones de estudiantes
  const studentOptions = useMemo<SelectOption[]>(() => {
    const list: SelectOption[] = [
      {
        value: 'ALL',
        label: `Todos los Alumnos (${students.length})`,
      },
    ];

    students.forEach((st) => {
      list.push({
        value: st.id,
        label: st.fullName,
        description: st.email,
        badge: st.registrationNumber,
      });
    });

    return list;
  }, [students]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Contenedor de Selectores Atómicos */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
        {/* Selector de Sesión con Buscador */}
        <div className="flex-1 sm:max-w-xs">
          <Select
            value={selectedDate || 'ALL'}
            onChange={onDateChange}
            options={sessionOptions}
            icon={Calendar}
            placeholder="Seleccionar sesión..."
            searchable={schedules.length > 5}
            searchPlaceholder="Buscar por fecha o sesión..."
          />
        </div>

        {/* Selector de Estudiante con Buscador */}
        <div className="flex-1 sm:max-w-xs">
          <Select
            value={selectedStudentId || 'ALL'}
            onChange={onStudentChange}
            options={studentOptions}
            icon={Users}
            placeholder="Seleccionar alumno..."
            searchable={true}
            searchPlaceholder="Buscar por nombre o cédula..."
          />
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
