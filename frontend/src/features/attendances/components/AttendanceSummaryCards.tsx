'use client';

import React from 'react';
import { AttendanceSummaryMetrics } from '../types/attendance.types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  CalendarDays,
  ShieldCheck,
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
          '¡Alerta Temprana! Estás en condición EN RIESGO de reprobación por ausentismo. Una inasistencia adicional causará la pérdida del módulo.',
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

  const getPercentageColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-700';
    if (pct >= 70) return 'text-amber-700';
    return 'text-rose-700';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Cuadrícula de 5 Tarjetas de KPIs estilo Matriz de Administración */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Tasa de Asistencia */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tasa Asistencia
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight ${getPercentageColor(
                percentage
              )}`}
            >
              {percentage.toFixed(1)}%
            </span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-500 ${
                  percentage >= 80
                    ? 'bg-emerald-600'
                    : percentage >= 70
                    ? 'bg-amber-500'
                    : 'bg-rose-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 truncate">
            Mínimo req. 80.0%
          </div>
        </div>

        {/* KPI 2: Total Presentes */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Asistencias
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
              {summary.attendedCount}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium truncate">
            Marcas confirmadas
          </div>
        </div>

        {/* KPI 3: Inasistencias */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Inasistencias
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-100">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight ${
                summary.absentCount > 0 ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {summary.absentCount}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-rose-700 font-medium truncate">
            Faltas computadas
          </div>
        </div>

        {/* KPI 4: Clases Dictadas */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Clases Dictadas
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
              {pastClasses}
              <span className="text-xs text-slate-400 font-sans font-normal ml-1">
                / {summary.totalClasses}
              </span>
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 truncate">
            {Math.max(0, summary.totalClasses - pastClasses)} sesiones pendientes
          </div>
        </div>

        {/* KPI 5: Condición Reglamentaria */}
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Condición
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <StatusBadge status={traffic.statusCode} />
          </div>
          <div className="mt-2 text-[11px] text-slate-500 truncate">
            Reglamento oficial
          </div>
        </div>
      </div>

      {/* 2. Banner Pedagógico Contextual de Semáforo */}
      <div
        className={`p-3.5 sm:p-4 rounded-xl border flex items-start gap-3 shadow-2xs ${traffic.bannerTheme}`}
        role="alert"
      >
        <TrafficIcon className={`w-5 h-5 shrink-0 mt-0.5 ${traffic.iconColor}`} />
        <div className="flex-1 text-xs">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold tracking-tight">Dictamen de Regularidad</span>
            <span className="font-mono tabular-nums font-bold">
              ({percentage.toFixed(1)}%)
            </span>
          </div>
          <p className="leading-relaxed opacity-95">{traffic.message}</p>
        </div>
      </div>
    </div>
  );
}
