'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldCheck,
  Calendar,
  User,
  Database,
  ArrowRight,
  Globe,
  Code2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { ActivityLogItem } from '../types/activity-logs.types';

interface ActivityLogDetailModalProps {
  log: ActivityLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLogDetailModal: React.FC<ActivityLogDetailModalProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloquear scroll de fondo cuando el modal esté abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setShowRawJson(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !log) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const datePart = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
      const timePart = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      return `${datePart} ${timePart}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col text-slate-900">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="audit-modal-title"
                className="text-base font-bold text-slate-900"
              >
                Inspección de Registro de Auditoría
              </h3>
              <p className="text-[11px] font-mono tabular-nums text-slate-400">
                UUID: {log.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto space-y-4 py-4 pr-1 text-xs">
          {/* Fila de Metadatos de Autoría y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Ejecutado por:</span>
              </div>
              <div className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                {log.userIdentifier}
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                Rol: {log.userRole}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Fecha y Hora del Evento:</span>
              </div>
              <div className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                {formatDate(log.createdAt)}
              </div>
              {log.ipAddress && (
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span>IP: {log.ipAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información de Acción y Entidad */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Tipo de Acción Auditada:</span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                {log.action}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Entidad Afectada:</span>
              <span className="font-mono text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                {log.entityAffected} {log.entityId ? `(ID: ${log.entityId.slice(0, 8)}...)` : ''}
              </span>
            </div>
          </div>

          {/* Comparativa Diff: Antes (Rojo Tenue) vs Después (Verde Esmeralda) */}
          <div className="space-y-2">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Comparativa de Estado (Antes vs Después):
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Valor Previo (Rojo Tenue) */}
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/60">
                <div className="font-bold text-xs text-rose-800 mb-1.5 flex items-center justify-between">
                  <span>Valor Previo (Antes)</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                    Anterior
                  </span>
                </div>
                <pre className="p-2.5 rounded-lg bg-white text-rose-950 font-mono tabular-nums text-[11px] overflow-x-auto border border-rose-200/80 max-h-48">
                  {log.previousValue
                    ? JSON.stringify(log.previousValue, null, 2)
                    : '(Sin registro previo / creación inicial)'}
                </pre>
              </div>

              {/* Valor Nuevo (Verde Esmeralda) */}
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                <div className="font-bold text-xs text-emerald-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-emerald-600" />
                    <span>Valor Posterior (Después)</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                    Modificado
                  </span>
                </div>
                <pre className="p-2.5 rounded-lg bg-white text-emerald-950 font-mono tabular-nums text-[11px] overflow-x-auto border border-emerald-200/80 max-h-48">
                  {log.newValue
                    ? JSON.stringify(log.newValue, null, 2)
                    : '(Sin valor registrado)'}
                </pre>
              </div>
            </div>
          </div>

          {/* Bloque Colapsable de JSON Crudo Completo */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              {showRawJson ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ver Carga JSON Completa del Evento</span>
            </button>

            {showRawJson && (
              <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800 animate-fade-in">
                {JSON.stringify(log, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="pt-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};
