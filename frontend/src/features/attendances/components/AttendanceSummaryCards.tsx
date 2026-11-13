'use client';

import React from 'react';
import { AttendanceSummaryMetrics } from '../types/attendance.types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  CheckCircle2,
  XCircle,
  CalendarDays,
  Percent,
  AlertTriangle,
  Info,
} from 'lucide-react';

export interface AttendanceSummaryCardsProps {
  summary: AttendanceSummaryMetrics;
  className?: string;
}

export function AttendanceSummaryCards({
  summary,
  className = '',
}: AttendanceSummaryCardsProps) {
  const percentage = summary.attendancePercentage ?? 0;
  const pastClasses = summary.pastClasses ?? 0;

  // Semáforo estandarizado institucional con un decimal
  const getTrafficLight = (pct: number, past: number) => {
    if (past === 0) {
      return {
        statusCode: 'REGULAR',
        label: 'Regular (100%)',
        bannerTheme: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        icon: Info,
        iconColor: 'text-emerald-700',
        message:
          'Ciclo Académico en Inicio: Aún no se han completado clases en el calendario. Tu condición actual es REGULAR.',
      };
    }
    if (pct >= 80.0) {
      return {
        statusCode: 'REGULAR',
        label: 'Regular (≥80%)',
        bannerTheme: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        icon: CheckCircle2,
        iconColor: 'text-emerald-700',
        message:
          'Condición Académica: REGULAR. Cumples satisfactoriamente con el requisito mínimo del 80% de asistencia exigido por el reglamento.',
      };
    }
    if (pct >= 70.0) {
      return {
        statusCode: 'EN_RIESGO',
        label: 'En Riesgo (70-79%)',
        bannerTheme: 'bg-amber-50 border-amber-200 text-amber-900',
        icon: AlertTriangle,
        iconColor: 'text-amber-700',
        message:
          '¡Alerta Temprana! Estás en condición EN RIESGO de reprobación por ausentismo. Una falta adicional causará la pérdida del módulo.',
      };
    }
    return {
      statusCode: 'REPROBADO',
      label: 'Reprobado (<70%)',
      bannerTheme: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: XCircle,
      iconColor: 'text-rose-700',
      message:
        'Condición Académica: INSUFICIENTE / REPROBADO POR FALTAS. Has superado el tope máximo del 20% de inasistencias en este módulo.',
    };
  };

  const traffic = getTrafficLight(percentage, pastClasses);
  const TrafficIcon = traffic.icon;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Alerta Pedagógica Contextual del Semáforo */}
      <div
        className={`p-3.5 sm:p-4 rounded-xl border flex items-start gap-3 shadow-2xs ${traffic.bannerTheme}`}
        role="alert"
      >
        <TrafficIcon className={`w-5 h-5 shrink-0 mt-0.5 ${traffic.iconColor}`} />
        <div className="flex-1 text-xs">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold tracking-tight">Estado Académico</span>
            <StatusBadge status={traffic.statusCode} size="sm" showIcon={false} />
          </div>
          <p className="leading-relaxed opacity-95">{traffic.message}</p>
        </div>
      </div>

      {/* 2. Cuadrícula de 4 Tarjetas de Balance Métrico */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Tarjeta 1: % Regularidad */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              % Regularidad
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
              <div
                className={`h-full transition-all duration-500 ${
                  percentage >= 80 ? 'bg-emerald-600' : percentage >= 70 ? 'bg-amber-500' : 'bg-rose-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block font-medium">
              Mínimo requerido: 80.0%
            </span>
          </div>
        </div>

        {/* Tarjeta 2: Clases Asistidas */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Asistencias
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                {summary.attendedCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">clases</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              Puntuales y justificadas
            </p>
          </div>
        </div>

        {/* Tarjeta 3: Inasistencias */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Inasistencias
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums ${
                  summary.absentCount > 0 ? 'text-rose-700' : 'text-slate-900'
                }`}
              >
                {summary.absentCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">faltas</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              Sin justificación aprobada
            </p>
          </div>
        </div>

        {/* Tarjeta 4: Total Sesiones del Módulo */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Sesiones Totales
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                {summary.pastClasses}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                de {summary.totalClasses}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              {Math.max(0, summary.totalClasses - summary.pastClasses)} sesiones pendientes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
