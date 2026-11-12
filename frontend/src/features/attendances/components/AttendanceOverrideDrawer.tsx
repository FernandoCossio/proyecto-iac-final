'use client';

import React, { useState, useEffect } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MatrixRowItem, AttendanceStatus } from '../types/admin-attendance.types';
import { AdminAttendanceService } from '../services/admin-attendance.service';
import {
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export interface AttendanceOverrideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  row: MatrixRowItem | null;
  onSuccess: () => void;
}

export const AttendanceOverrideDrawer: React.FC<AttendanceOverrideDrawerProps> = ({
  isOpen,
  onClose,
  row,
  onSuccess,
}) => {
  const [targetStatus, setTargetStatus] = useState<AttendanceStatus>('JUSTIFICADO');
  const [justification, setJustification] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar estado sugerido cuando cambia la fila seleccionada
  useEffect(() => {
    if (row) {
      if (row.status === 'FALTA') {
        setTargetStatus('JUSTIFICADO');
      } else if (row.status === 'PRESENTE') {
        setTargetStatus('FALTA');
      } else {
        setTargetStatus('PRESENTE');
      }
      setJustification('');
      setValidationError(null);
    }
  }, [row]);

  if (!row) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (justification.trim().length < 5) {
      setValidationError(
        'El motivo es obligatorio y debe tener al menos 5 caracteres descriptivos para fines de auditoría.',
      );
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      await AdminAttendanceService.overrideAttendance({
        studentId: row.studentId,
        classScheduleId: row.classScheduleId,
        status: targetStatus,
        justification: justification.trim(),
      });

      toast.success('Asistencia actualizada exitosamente', {
        description: `Se registró ${targetStatus} para ${row.studentName} en auditoría.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Error al actualizar el registro de asistencia';
      setValidationError(msg);
      toast.error('Error al modificar asistencia', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Modificar Asistencia"
      subtitle="Justificación y cambio de estado con auditoría inmutable"
      width="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Confirmar Justificación</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Ficha Resumida del Alumno */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Estudiante:</span>
            <span className="font-semibold text-slate-900 truncate max-w-[220px]">
              {row.studentName}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Documento (CI):</span>
            <span className="font-mono tabular-nums font-semibold text-slate-800">
              {row.registrationNumber}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Fecha de Clase:</span>
            <span className="font-mono tabular-nums text-slate-700">
              {row.classDate} ({row.timeRange})
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200/80">
            <span className="text-slate-500">Estado Actual:</span>
            <StatusBadge status={row.status} size="sm" />
          </div>
        </div>

        {/* Selector de Nuevo Estado */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Nuevo Estado a Asignar:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* 1. Presente */}
            <button
              type="button"
              onClick={() => setTargetStatus('PRESENTE')}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                targetStatus === 'PRESENTE'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-400/30'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Presente</span>
            </button>

            {/* 2. Justificado */}
            <button
              type="button"
              onClick={() => setTargetStatus('JUSTIFICADO')}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                targetStatus === 'JUSTIFICADO'
                  ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-400/30'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Justificado</span>
            </button>

            {/* 3. Retardo */}
            <button
              type="button"
              onClick={() => setTargetStatus('RETARDO')}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                targetStatus === 'RETARDO'
                  ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-400/30'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Retardo</span>
            </button>

            {/* 4. Falta */}
            <button
              type="button"
              onClick={() => setTargetStatus('FALTA')}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                targetStatus === 'FALTA'
                  ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-400/30'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Falta</span>
            </button>
          </div>
        </div>

        {/* Campo Obligatorio de Motivo */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="drawer-justification"
              className="text-xs font-bold text-slate-700"
            >
              Motivo u Observación Obligatoria:
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {justification.length}/200
            </span>
          </div>
          <textarea
            id="drawer-justification"
            rows={3}
            maxLength={200}
            value={justification}
            onChange={(e) => {
              setJustification(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Ej. Presentó certificado médico del centro de salud o reposo oficial..."
            className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none transition-colors"
          />
          {validationError && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {validationError}
            </p>
          )}
        </div>

        {/* Aviso de Auditoría */}
        <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Esta acción quedará registrada en la bitácora inmutable de auditoría con la comparación del estado previo vs nuevo y su motivo.
          </span>
        </div>
      </form>
    </Drawer>
  );
};
