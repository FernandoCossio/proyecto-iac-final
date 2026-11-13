'use client';

import React, { useState } from 'react';
import { CalendarCheck2, AlertCircle, BookOpen } from 'lucide-react';
import { useAdminAttendanceMatrix } from '@/features/attendances/hooks/useAdminAttendanceMatrix';
import { AdminAttendanceStatsCards } from '@/features/attendances/components/AdminAttendanceStatsCards';
import { AdminAttendanceFilters } from '@/features/attendances/components/AdminAttendanceFilters';
import { AdminAttendanceTable } from '@/features/attendances/components/AdminAttendanceTable';
import { AttendanceOverrideDrawer } from '@/features/attendances/components/AttendanceOverrideDrawer';
import { MatrixRowItem } from '@/features/attendances/types/admin-attendance.types';

export default function AdminAsistenciasPage() {
  const { data, filters, loading, error, updateFilters, refresh } =
    useAdminAttendanceMatrix();

  const [selectedRowForOverride, setSelectedRowForOverride] =
    useState<MatrixRowItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenOverride = (row: MatrixRowItem) => {
    setSelectedRowForOverride(row);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRowForOverride(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Encabezado de la Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Matriz y Control de Asistencias
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervisión de sesiones, cálculo de regularidad y justificaciones administrativas
              </p>
            </div>
          </div>
        </div>

        {data?.moduleName && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-semibold shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>{data.moduleName}</span>
          </div>
        )}
      </div>

      {/* 2. Mensaje de Error si aplica */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <div>
            <div className="font-bold">Error al consultar la matriz de asistencias</div>
            <div className="mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* 3. Tarjetas de Métricas de la Sesión / Módulo */}
      {data && <AdminAttendanceStatsCards summary={data.summary} />}

      {/* 4. Barra de Filtros y Selector Horizontal de Sesiones */}
      {data && (
        <AdminAttendanceFilters
          schedules={data.schedules}
          students={data.students}
          selectedDate={filters.classDate || 'ALL'}
          selectedStudentId={filters.studentId || 'ALL'}
          onDateChange={(date) => updateFilters({ classDate: date })}
          onStudentChange={(stId) => updateFilters({ studentId: stId })}
          onRefresh={refresh}
          loading={loading}
        />
      )}

      {/* 5. Tabla Densa con Sticky Header y font-mono */}
      <AdminAttendanceTable
        rows={data?.rows || []}
        onOpenOverride={handleOpenOverride}
        loading={loading}
      />

      {/* 6. Panel Lateral Deslizante (Drawer) para Justificar Faltas */}
      <AttendanceOverrideDrawer
        row={selectedRowForOverride}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSuccess={refresh}
      />
    </div>
  );
}
