'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModuleImportStepper } from '@/features/modules/components/ModuleImportStepper';
import { useModuleImportWizard } from '@/features/modules/hooks/useModuleImportWizard';
import { ModuleMetadataForm } from '@/features/modules/components/ModuleMetadataForm';
import { ModulePreviewSummaryCards } from '@/features/modules/components/ModulePreviewSummaryCards';
import { ModulePreviewTabs } from '@/features/modules/components/ModulePreviewTabs';
import { ActivationModalConfirmation } from '@/features/modules/components/ActivationModalConfirmation';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowRight,
} from 'lucide-react';

export default function ModulePreviewPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const {
    metadata,
    setMetadata,
    students,
    schedules,
    studentErrors,
    scheduleErrors,
    estimatedStartDate,
    estimatedEndDate,
    hasErrors,
    isFormComplete,
    canActivate,
    isConfirmationOpen,
    setIsConfirmationOpen,
    isActivating,
    activationSuccess,
    activatedModuleData,
    errorMessage,
    activateModule,
  } = useModuleImportWizard();

  useEffect(() => {
    const storedToken =
      localStorage.getItem('admin_token') ||
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('admin_token='))
        ?.split('=')[1];

    if (!storedToken) {
      router.push('/admin/login');
      return;
    }
    setToken(storedToken);
  }, [router]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Stepper de Progreso */}
      <ModuleImportStepper currentStep={3} />

      {/* Cabecera del Paso */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>Paso 3: Vista Previa y Activación del Módulo</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Revise los datos consolidados y confirme la activación oficial para habilitar el registro de asistencias.
          </p>
        </div>
      </div>

      {/* Notificación de Éxito al Activar */}
      {activationSuccess && (
        <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 shadow-2xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-bold text-emerald-950">
                ¡Módulo Académico Activado Exitosamente!
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                El módulo &quot;{activatedModuleData?.name || metadata.name}&quot; (
                <span className="font-mono font-bold text-emerald-950">
                  {activatedModuleData?.code || metadata.code}
                </span>
                ) ha quedado habilitado como el módulo activo oficial del sistema.
              </p>
              <div className="text-xs text-emerald-900 font-medium pt-1 flex flex-wrap gap-3 font-mono tabular-nums">
                <span>Matriculados: <strong>{activatedModuleData?.studentsCount ?? students.length}</strong></span>
                <span>•</span>
                <span>Clases: <strong>{activatedModuleData?.schedulesCount ?? schedules.length}</strong></span>
                <span>•</span>
                <span>Vigencia: <strong>{activatedModuleData?.startDate || estimatedStartDate}</strong> al <strong>{activatedModuleData?.endDate || estimatedEndDate}</strong></span>
              </div>
              {activatedModuleData?.archivedPreviousModuleInfo && (
                <div className="mt-2.5 p-2.5 bg-emerald-100/70 rounded-lg border border-emerald-300/80 text-emerald-950 text-xs flex items-center gap-2">
                  <Archive className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span><strong>Preservación Histórica:</strong> {activatedModuleData.archivedPreviousModuleInfo}.</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <span>Ir al Panel de Administración</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Mensaje de Error si aplica */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-2xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Advertencia si no hay datos cargados */}
      {students.length === 0 && schedules.length === 0 && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              No se encontraron datos cargados en la sesión. Comience cargando la nómina de estudiantes y el calendario.
            </span>
          </div>
          <Link
            href="/admin/modulo/importar"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition-colors whitespace-nowrap self-end sm:self-auto"
          >
            Iniciar en Paso 1
          </Link>
        </div>
      )}

      {/* Formulario de Metadatos del Módulo */}
      <ModuleMetadataForm
        metadata={metadata}
        onChange={setMetadata}
        disabled={activationSuccess}
      />

      {/* Tarjetas Resumen KPI */}
      <ModulePreviewSummaryCards
        totalStudents={students.length}
        totalSchedules={schedules.length}
        estimatedStartDate={estimatedStartDate}
        estimatedEndDate={estimatedEndDate}
        canActivate={canActivate}
        hasErrors={hasErrors}
      />

      {/* Pestañas de Visualización de Nómina y Cronograma */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <ModulePreviewTabs
          students={students}
          schedules={schedules}
          studentErrors={studentErrors}
          scheduleErrors={scheduleErrors}
        />
      </div>

      {/* Barra de Acciones de Activación */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-slate-200">
        <Link
          href="/admin/modulo/importar/fechas"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Paso 2 (Calendario)</span>
        </Link>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {!canActivate && (
            <span className="text-xs text-rose-600 font-medium text-center sm:text-right">
              {hasErrors
                ? 'Debe corregir las inconsistencias antes de activar.'
                : !isFormComplete
                ? 'Complete el nombre, código y cargue ambos archivos.'
                : ''}
            </span>
          )}

          <button
            type="button"
            disabled={!canActivate || activationSuccess}
            onClick={() => setIsConfirmationOpen(true)}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs shadow-xs transition-all ${
              canActivate && !activationSuccess
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Activar Módulo Académico</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <ActivationModalConfirmation
        isOpen={isConfirmationOpen}
        metadata={metadata}
        totalStudents={students.length}
        totalSchedules={schedules.length}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={() => activateModule(token || undefined)}
        isSubmitting={isActivating}
      />
    </div>
  );
}
