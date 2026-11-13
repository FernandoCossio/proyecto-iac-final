'use client';

import React from 'react';
import { useStudentAuth } from '@/features/auth/hooks/useStudentAuth';
import { useStudentHistory } from '@/features/attendances/hooks/useStudentHistory';
import { TodayClassCard } from '@/features/attendances/components/TodayClassCard';
import { StudentModuleCalendar } from '@/features/attendances/components/StudentModuleCalendar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Sparkles } from 'lucide-react';

export default function AsistenciaPage() {
  const { student } = useStudentAuth();
  const { data: historyData, isLoading: isHistoryLoading } = useStudentHistory();

  const moduleName = student?.module?.name || 'Módulo Académico Activo';
  const firstName = student?.fullName ? student.fullName.split(' ')[0] : 'Estudiante';

  const regularStatus =
    historyData?.summary.attendancePercentage !== undefined &&
    historyData?.summary.attendancePercentage < 70
      ? 'REPROBADO'
      : historyData?.summary.attendancePercentage !== undefined &&
        historyData?.summary.attendancePercentage < 80
      ? 'EN_RIESGO'
      : 'REGULAR';

  return (
    <div className="space-y-6">
      {/* 1. Cabecera Institucional Sobria (Sin códigos técnicos redundantes) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>¡Hola, {firstName}!</span>
            <Sparkles className="w-5 h-5 text-emerald-600 hidden sm:inline-block" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {moduleName}
          </p>
        </div>

        {historyData && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-600">
              Estado Académico:
            </span>
            <StatusBadge status={regularStatus} />
          </div>
        )}
      </div>

      {/* 2. Cuadrícula Principal: Tarjeta Transaccional + Calendario de Sesiones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Tarjeta Transaccional de Hoy */}
        <div className="lg:col-span-6 xl:col-span-6">
          <TodayClassCard moduleName={moduleName} />
        </div>

        {/* Columna Derecha: Calendario Visual Interactivo de Sesiones */}
        <div className="lg:col-span-6 xl:col-span-6">
          <StudentModuleCalendar
            sessions={historyData?.sessions || []}
            isLoading={isHistoryLoading}
          />
        </div>
      </div>
    </div>
  );
}
