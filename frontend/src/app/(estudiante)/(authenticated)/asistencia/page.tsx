'use client';

import React from 'react';
import { useStudentAuth } from '@/features/auth/hooks/useStudentAuth';
import { TodayClassCard } from '@/features/attendances/components/TodayClassCard';
import { BookOpen } from 'lucide-react';

export default function AsistenciaPage() {
  const { student } = useStudentAuth();

  const moduleName = student?.module?.name || 'Módulo Académico Activo';
  const moduleCode = student?.module?.code || '';

  return (
    <div className="space-y-6">
      {/* Banner Contextual del Módulo Activo */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 mt-0.5">
            <BookOpen className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                {moduleName}
              </span>
              {moduleCode && (
                <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {moduleCode}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Portal Oficial de Registro de Asistencia
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta Central Transaccional de Marcación */}
      <TodayClassCard moduleName={moduleName} moduleCode={moduleCode} />
    </div>
  );
}
