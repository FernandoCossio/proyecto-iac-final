'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModuleImportStepper } from '@/features/modules/components/ModuleImportStepper';
import { FileDropzone } from '@/features/modules/components/FileDropzone';
import { StudentErrorsTable } from '@/features/modules/components/StudentErrorsTable';
import { StudentsTablePreview } from '@/features/modules/components/StudentsTablePreview';
import { ModuleImportService } from '@/features/modules/services/module-import.service';
import {
  RowValidationError,
  StudentRow,
} from '@/features/modules/types/module-import.types';
import {
  Users,
  ArrowRight,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  Info,
  Download,
} from 'lucide-react';

export default function ImportarEstudiantesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorsList, setErrorsList] = useState<RowValidationError[]>([]);
  const [validStudents, setValidStudents] = useState<StudentRow[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    setSelectedFile(file);
    setIsLoading(true);
    setErrorMessage(null);
    setErrorsList([]);
    setValidStudents([]);

    const response = await ModuleImportService.importStudents(file, token);
    setIsLoading(false);

    if (!response.success) {
      setErrorMessage(response.message);
      if (response.errorData && response.errorData.errors) {
        setErrorsList(response.errorData.errors);
      }
    } else if (response.data) {
      setValidStudents(response.data.data);
      sessionStorage.setItem(
        'pending_students_import',
        JSON.stringify(response.data.data),
      );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Stepper de Progreso */}
      <ModuleImportStepper currentStep={1} />

      {/* Cabecera del Paso */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Paso 1: Carga de Nómina de Estudiantes</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cargue la planilla Excel con los alumnos admitidos en el módulo académico.
          </p>
        </div>

        {/* Enlace a plantilla modelo */}
        <a
          href="/templates/plantilla-estudiantes-postgrado.xlsx"
          download
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
          title="Descargar archivo modelo con las 3 columnas reglamentarias"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span>Plantilla Oficial (.xlsx)</span>
        </a>
      </div>

      {/* Guía Estructura de Columnas */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Estructura Oficial del Archivo Excel (.xlsx / .xls)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          La primera fila debe contener estrictamente los siguientes tres encabezados:
        </p>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 text-xs">
            <span className="font-bold font-mono text-slate-800 block mb-0.5">
              1. registrationNumber
            </span>
            <span className="text-slate-500 text-[11px] leading-tight block">
              Número de registro o cédula de identidad única del alumno.
            </span>
          </div>
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 text-xs">
            <span className="font-bold font-mono text-slate-800 block mb-0.5">
              2. fullName
            </span>
            <span className="text-slate-500 text-[11px] leading-tight block">
              Nombres y apellidos completos según inscripción formal.
            </span>
          </div>
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 text-xs">
            <span className="font-bold font-mono text-slate-800 block mb-0.5">
              3. email
            </span>
            <span className="text-slate-500 text-[11px] leading-tight block">
              Correo electrónico institucional para acceso a las sesiones.
            </span>
          </div>
        </div>
      </div>

      {/* Dropzone de Carga de Archivo */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <FileDropzone
          onFileSelected={handleFileSelected}
          isLoading={isLoading}
          title="Seleccionar archivo de nómina (.xlsx, .xls)"
          subtitle="Arrastre su archivo Excel o haga clic para examinar su equipo"
        />

        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2.5 p-3 bg-indigo-50/70 rounded-lg border border-indigo-100 text-indigo-900 text-xs font-semibold">
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
            <span>Validando formato, consistencia y unicidad de matrículas...</span>
          </div>
        )}
      </div>

      {/* Errores por fila */}
      {errorsList.length > 0 && (
        <StudentErrorsTable errors={errorsList} />
      )}

      {/* Mensaje de error general si no hay lista detallada */}
      {errorMessage && errorsList.length === 0 && !isLoading && (
        <div
          role="alert"
          className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2.5 shadow-2xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Vista previa de estudiantes válidos */}
      {validStudents.length > 0 && (
        <div className="space-y-4">
          <StudentsTablePreview students={validStudents} />

          <div className="flex justify-end pt-2">
            <Link
              href="/admin/modulo/importar/fechas"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>Continuar a Paso 2: Calendario</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
