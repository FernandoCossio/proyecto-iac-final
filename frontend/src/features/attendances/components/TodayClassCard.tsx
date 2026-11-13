'use client';

import React from 'react';
import { toast } from 'sonner';
import { useAttendanceCheckIn } from '../hooks/useAttendanceCheckIn';
import { formatDate } from '../../../lib/utils';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarOff,
  ShieldCheck,
  Loader2,
  Lock,
} from 'lucide-react';

export interface TodayClassCardProps {
  moduleName?: string;
  moduleCode?: string;
  className?: string;
}

export function TodayClassCard({
  moduleName = 'Módulo Activo',
  moduleCode = '',
  className = '',
}: TodayClassCardProps) {
  const {
    data,
    isLoading,
    isSubmitting,
    successMessage,
    errorMessage,
    executeCheckIn,
  } = useAttendanceCheckIn();

  const handleCheckIn = async () => {
    try {
      const attendance = await executeCheckIn();
      if (attendance) {
        const timeStr = attendance.markedAt ? formatTime(attendance.markedAt) : 'hora auditada';
        toast.success(`¡Asistencia confirmada a las ${timeStr}!`, {
          description: 'Tu presencia en la sesión ha quedado grabada en la base de datos inmutable.',
        });
      }
    } catch (err: any) {
      toast.error('Error al registrar la marcación', {
        description: err?.message || 'No se pudo registrar la marcación. Intente nuevamente.',
      });
    }
  };

  const formatTime = (timeString?: string | Date | null) => {
    if (!timeString) return '';
    if (typeof timeString === 'string' && timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
    return String(timeString);
  };

  // Validación de ventana horaria para Estado A
  const checkTimeWindow = () => {
    if (!data?.classSchedule) return { canCheckIn: true, message: null };
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

    const { startTime, endTime } = data.classSchedule;

    if (startTime && currentTimeStr < startTime) {
      return {
        canCheckIn: false,
        message: `Marcación disponible a partir de las ${startTime}`,
      };
    }

    if (endTime && currentTimeStr > endTime) {
      return {
        canCheckIn: false,
        message: 'Ventana de marcación cerrada (sesión finalizada)',
      };
    }

    return { canCheckIn: true, message: null };
  };

  const timeWindow = checkTimeWindow();

  return (
    <div
      className={`w-full max-w-xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden transition-all ${className}`}
    >
      {/* 1. Header Institucional de la Tarjeta */}
      <div className="bg-slate-900 p-5 sm:p-6 text-white border-b border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 bg-slate-800 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase border border-slate-700 text-emerald-400">
            {moduleCode || 'MÓDULO ACTIVO'}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Módulo Oficial en Curso</span>
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold leading-snug text-white">
          {moduleName}
        </h2>
      </div>

      {/* 2. Cuerpo de Estados Operativos */}
      <div className="p-5 sm:p-7 space-y-5">
        {/* Banner de Éxito Inmediato */}
        {successMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5 shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-900">{successMessage}</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Tu asistencia ha quedado registrada de forma inmutable en el sistema de auditoría.
              </p>
            </div>
          </div>
        )}

        {/* Banner de Error */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Estado: Cargando sincronización */}
        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-2.5">
            <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-600">
              Sincronizando estado de clase oficial...
            </p>
          </div>
        ) : data?.hasClassToday ? (
          /* ESTADO 1 y 2: HAY CLASE HOY */
          <div className="space-y-5">
            {/* Contexto de la sesión */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Sesión Programada Hoy
                </span>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <CalendarDays className="w-4 h-4 text-slate-500" />
                  <span className="font-mono tabular-nums">
                    {formatDate(data.classSchedule?.classDate || '')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-mono tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Horario: {data.classSchedule?.startTime} a {data.classSchedule?.endTime}
                  </span>
                </div>
              </div>

              <div className="self-start sm:self-auto shrink-0">
                {data.alreadyMarked ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Presente / Puntual</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pendiente de Marcación</span>
                  </span>
                )}
              </div>
            </div>

            {/* ESTADO 2: YA REGISTRADA */}
            {data.alreadyMarked ? (
              <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center space-y-2">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 mb-1 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Asistencia Registrada Correctamente
                </h3>
                <p className="text-xs text-slate-600 font-mono tabular-nums">
                  Marca de auditoría:{' '}
                  <strong className="text-emerald-700 font-bold">
                    {formatTime(data.attendance?.markedAt)}
                  </strong>
                </p>
                <div className="w-full mt-3 py-2.5 px-3 bg-white text-slate-500 font-semibold text-xs rounded-lg border border-slate-200 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Registro completado (envíos duplicados bloqueados)</span>
                </div>
              </div>
            ) : (
              /* ESTADO 1: SESIÓN ACTIVA PENDIENTE */
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={isSubmitting || !timeWindow.canCheckIn}
                  className="w-full h-13 px-6 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Registrando asistencia en 1 toque...</span>
                    </>
                  ) : !timeWindow.canCheckIn ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{timeWindow.message}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>REGISTRAR MI ASISTENCIA AHORA</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-slate-500 leading-tight">
                  Un solo toque registra tu asistencia de forma auditada para la clase de hoy.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ESTADO 3: SIN CLASE HOY (Día No Lectivo) */
          <div className="py-6 text-center space-y-3.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 shadow-2xs">
              <CalendarOff className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Hoy no hay clase programada en el calendario
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                La marcación se habilitará automáticamente durante el horario de la próxima sesión.
              </p>
            </div>

            {data?.nextScheduledClass && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 inline-flex flex-col sm:flex-row items-center gap-1.5 font-mono tabular-nums">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                  <span>Próxima clase programada:</span>
                </div>
                <span>
                  {formatDate(data.nextScheduledClass.classDate)} de {data.nextScheduledClass.startTime} a {data.nextScheduledClass.endTime}
                </span>
              </div>
            )}

            <div className="w-full py-2.5 px-3 bg-slate-100 text-slate-400 font-semibold text-xs rounded-lg border border-slate-200">
              Botón de Marcación Inhabilitado (Día no lectivo)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
