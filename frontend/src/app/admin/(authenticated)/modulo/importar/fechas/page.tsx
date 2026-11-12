'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModuleImportStepper } from '@/features/modules/components/ModuleImportStepper';
import { FileDropzone } from '@/features/modules/components/FileDropzone';
import { ScheduleErrorsTable } from '@/features/modules/components/ScheduleErrorsTable';
import { SchedulesTablePreview } from '@/features/modules/components/SchedulesTablePreview';
import { ModuleImportService } from '@/features/modules/services/module-import.service';
import { RowValidationError } from '@/features/modules/types/module-import.types';
import { ScheduleRow } from '@/features/modules/types/schedule-import.types';
import {
  CalendarDays,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  Info,
  Download,
} from 'lucide-react';

export default function ImportarFechasPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorsList, setErrorsList] = useState<RowValidationError[]>([]);
  const [validSchedules, setValidSchedules] = useState<ScheduleRow[]>([]);

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

  const handleFileSelected = async (file: File) => {
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);
    setErrorsList([]);
    setValidSchedules([]);

    const response = await ModuleImportService.importSchedules(file, token);
    setIsLoading(false);

    if (!response.success) {
      setErrorMessage(response.message);
      if (response.errorData && response.errorData.errors) {
        setErrorsList(response.errorData.errors);
      }
    } else if (response.data) {
      setValidSchedules(response.data.schedules);
      sessionStorage.setItem(
        'pending_schedules_import',
        JSON.stringify(response.data.schedules),
      );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Stepper de Progreso */}
      <ModuleImportStepper currentStep={2} />

      {/* Cabecera del Paso */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            <span>Paso 2: Carga de Calendario y Horarios de Clase</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cargue la planilla Excel con el cronograma y las jornadas de toma de asistencia.
          </p>
        </div>

        {/* Enlace a plantilla de calendario */}
        <a
          href="/templates/plantilla-fechas-postgrado.xlsx"
          download
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
          title="Descargar archivo modelo de calendario"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Plantilla Horarios (.xlsx)</span>
        </a>
      </div>

      {/* Guía Estructura de Columnas */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>Estructura Requerida de Horarios</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          La planilla de calendario debe respetar estrictamente los siguientes tres campos:
        </p>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 text-xs">
            <span className="font-bold font-mono text-slate-800 block mb-0.5">
              1. classDate
            </span>
            <span className="text-slate-500 text-[11px] leading-tight block">
              Fecha en formato <code className="text-indigo-600 font-mono">DD/MM/YYYY</code> o fecha ISO estándar.
            </span>
          </div>
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 text-xs">
            <span className="font-bold font-mono text-slate-800 block mb-0.5">
              2. startTime
            </span>
            <span className="text-slate-500 text-[11px] leading-tight block">
              Hora oficial de inicio de sesión en formato 24 horas (<code className="text-indigo-600 font-mono">18:30</code>).
            </span>
          </div>
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 text-xs">
            <span className="font-bold font-mono text-slate-800 block mb-0.5">
              3. endTime
            </span>
            <span className="text-slate-500 text-[11px] leading-tight block">
              Hora de conclusión en formato 24 horas (<code className="text-indigo-600 font-mono">21:30</code>).
            </span>
          </div>
        </div>
      </div>

      {/* Dropzone */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <FileDropzone
          onFileSelected={handleFileSelected}
          isLoading={isLoading}
          title="Seleccionar archivo de calendario (.xlsx, .xls)"
          subtitle="Arrastre el cronograma de clases o haga clic para examinar"
        />

        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2.5 p-3 bg-emerald-50/70 rounded-lg border border-emerald-100 text-emerald-900 text-xs font-semibold">
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>Validando orden cronológico y consistencia de horarios...</span>
          </div>
        )}
      </div>

      {/* Errores */}
      {errorsList.length > 0 && (
        <ScheduleErrorsTable errors={errorsList} />
      )}

      {/* Mensaje de error general */}
      {errorMessage && errorsList.length === 0 && !isLoading && (
        <div
          role="alert"
          className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2.5 shadow-2xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Vista previa de fechas válidas */}
      {validSchedules.length > 0 && (
        <div className="space-y-4">
          <SchedulesTablePreview schedules={validSchedules} />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Link
              href="/admin/modulo/importar"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Paso 1 (Nómina)</span>
            </Link>

            <Link
              href="/admin/modulo/preview"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>Continuar a Paso 3: Vista Previa y Activación</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
