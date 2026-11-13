'use client';

import React, { useState, useMemo } from 'react';
import { ClassSessionHistoryItem } from '../types/attendance.types';
import { formatDate } from '../../../lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

export interface StudentModuleCalendarProps {
  sessions: ClassSessionHistoryItem[];
  isLoading?: boolean;
  className?: string;
}

export function StudentModuleCalendar({
  sessions,
  isLoading = false,
  className = '',
}: StudentModuleCalendarProps) {
  // Fecha seleccionada para popover / detalle
  const [selectedSession, setSelectedSession] =
    useState<ClassSessionHistoryItem | null>(null);

  // Determinar mes inicial basado en las sesiones o en la fecha actual
  const initialDate = useMemo(() => {
    if (sessions.length > 0) {
      // Buscar primera sesión de hoy o futura, o la última
      const todayStr = new Date().toISOString().split('T')[0];
      const foundTodayOrFuture = sessions.find((s) => s.classDate >= todayStr);
      if (foundTodayOrFuture) {
        return new Date(foundTodayOrFuture.classDate + 'T12:00:00');
      }
      return new Date(sessions[0].classDate + 'T12:00:00');
    }
    return new Date();
  }, [sessions]);

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(initialDate);

  // Mapa de sesiones por fecha 'YYYY-MM-DD'
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, ClassSessionHistoryItem>();
    sessions.forEach((s) => {
      map.set(s.classDate, s);
    });
    return map;
  }, [sessions]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0 - 11

  const monthName = currentMonthDate.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Construir matriz de días para el mes
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    // Convertir a Lunes = 0 .. Domingo = 6
    const adjustedFirstDay = (firstDayIndex + 6) % 7;
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      session?: ClassSessionHistoryItem;
      isToday: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Días vacíos previos
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({
        dayNumber: 0,
        dateStr: '',
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Días del mes actual
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthPadded = String(month + 1).padStart(2, '0');
      const dayPadded = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthPadded}-${dayPadded}`;
      const session = sessionsByDate.get(dateStr);
      const isToday = dateStr === todayStr;

      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        session,
        isToday,
      });
    }

    return days;
  }, [year, month, sessionsByDate]);

  const getStatusIndicator = (status?: string) => {
    if (!status) return null;
    const s = status.toUpperCase();
    if (s === 'PRESENTE' || s === 'JUSTIFICADO') {
      return (
        <span
          title="Asistencia Registrada"
          className="w-2 h-2 rounded-full bg-emerald-500 shadow-2xs"
        />
      );
    }
    if (s === 'FALTA') {
      return (
        <span
          title="Inasistencia"
          className="w-2 h-2 rounded-full bg-rose-500 shadow-2xs"
        />
      );
    }
    if (s === 'PENDIENTE_HOY') {
      return (
        <span
          title="Clase Hoy (Pendiente)"
          className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-2xs"
        />
      );
    }
    return (
      <span
        title="Sesión Programada"
        className="w-1.5 h-1.5 rounded-full bg-slate-400"
      />
    );
  };

  const dayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Cabecera del Calendario */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 capitalize leading-tight">
                {monthName}
              </h3>
              <p className="text-[11px] text-slate-500">
                Calendario Oficial de Sesiones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Mes anterior"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Mes siguiente"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Leyenda de Estados */}
        <div className="flex flex-wrap items-center gap-3 py-2.5 text-[10px] text-slate-500 border-b border-slate-100">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Asistida
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Inasistencia
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Hoy
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Programada
          </span>
        </div>

        {/* Cuadrícula del Calendario */}
        <div className="mt-3">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {dayHeaders.map((dh) => (
              <span
                key={dh}
                className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1"
              >
                {dh}
              </span>
            ))}
          </div>

          {/* Celdas de días */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-10 sm:h-11 rounded-lg bg-slate-50/50"
                  />
                );
              }

              const hasSession = Boolean(cell.session);
              const isSelected =
                selectedSession?.classDate === cell.dateStr;

              let cellClasses =
                'h-10 sm:h-11 rounded-lg flex flex-col items-center justify-center relative transition-all text-xs font-semibold select-none';

              if (cell.isToday) {
                cellClasses +=
                  ' bg-emerald-50/80 text-emerald-950 font-bold border-2 border-emerald-500 shadow-xs';
              } else if (hasSession) {
                cellClasses +=
                  ' bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 cursor-pointer';
              } else {
                cellClasses += ' text-slate-400 hover:text-slate-600';
              }

              if (isSelected) {
                cellClasses += ' ring-2 ring-emerald-600 ring-offset-1';
              }

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  disabled={!hasSession}
                  onClick={() =>
                    cell.session && setSelectedSession(cell.session)
                  }
                  className={cellClasses}
                >
                  <span className="font-mono tabular-nums">
                    {cell.dayNumber}
                  </span>
                  {hasSession && (
                    <div className="absolute bottom-1">
                      {getStatusIndicator(cell.session?.status)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Popover / Tarjeta Contextual de Sesión Seleccionada */}
        {selectedSession && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 animate-fade-in relative text-left">
            <button
              type="button"
              onClick={() => setSelectedSession(null)}
              className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              aria-label="Cerrar detalle"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-slate-900 capitalize">
                {formatDate(selectedSession.classDate)}
              </span>
              <StatusBadge status={selectedSession.status} />
            </div>

            <div className="space-y-1 text-xs text-slate-600 font-mono tabular-nums">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Horario: {selectedSession.startTime} a {selectedSession.endTime}
                </span>
              </div>
              {selectedSession.markedAt && (
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Registrado a las{' '}
                    {new Date(selectedSession.markedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              )}
              {selectedSession.remarks && (
                <div className="text-[11px] text-slate-500 font-sans italic pt-1">
                  Nota: {selectedSession.remarks}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pie informativo del calendario */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
        <span>Total: {sessions.length} clases programadas</span>
        <span className="text-emerald-700 font-bold font-sans">
          {sessions.filter(
            (s) => s.status === 'PRESENTE' || s.status === 'JUSTIFICADO'
          ).length}{' '}
          asistidas
        </span>
      </div>
    </div>
  );
}
