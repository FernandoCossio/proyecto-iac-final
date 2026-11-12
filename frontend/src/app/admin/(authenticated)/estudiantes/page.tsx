'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/features/auth/services/auth.service';
import { StudentsService } from '@/features/students/services/students.service';
import {
  StudentFilterQuery,
  StudentItem,
  StudentListResponse,
} from '@/features/students/types/student.types';
import { ActiveStudentsTable } from '@/features/students/components/ActiveStudentsTable';
import { StudentDossierDrawer } from '@/features/students/components/StudentDossierDrawer';
import {
  Users,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function AdminStudentsDirectoryPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Estados de datos de estudiantes
  const [data, setData] = useState<StudentListResponse>({
    moduleName: 'Cargando módulo...',
    totalCount: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    students: [],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado del Drawer de Expediente
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Verificar autenticación administrativa
  useEffect(() => {
    const storedToken = authService.getStoredToken();

    if (!storedToken) {
      router.push('/admin/login');
      return;
    }

    setToken(storedToken);
    setIsLoadingAuth(false);
  }, [router]);

  // Función para consultar los estudiantes de la API
  const fetchStudents = useCallback(
    async (query: StudentFilterQuery, authToken: string) => {
      setIsFetching(true);
      setErrorMessage(null);
      try {
        const response = await StudentsService.getActiveModuleStudents(
          query,
          authToken,
        );
        setData(response);
      } catch (err: any) {
        setErrorMessage(
          err.message || 'No fue posible cargar el directorio de estudiantes.',
        );
      } finally {
        setIsFetching(false);
      }
    },
    [],
  );

  // Ejecutar consulta cuando cambie la búsqueda, página o token
  useEffect(() => {
    if (!token) return;

    fetchStudents(
      {
        search: searchTerm,
        page: currentPage,
        limit,
      },
      token,
    );
  }, [token, searchTerm, currentPage, limit, fetchStudents]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleOpenDossier = (student: StudentItem) => {
    setSelectedStudent(student);
    setIsDossierOpen(true);
  };

  const handleCloseDossier = () => {
    setIsDossierOpen(false);
    setSelectedStudent(null);
  };

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-medium text-slate-600">
            Cargando directorio de estudiantes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera y Resumen de Nómina */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Directorio de Estudiantes
            </h1>
            {data.moduleCode && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {data.moduleCode}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Padrón oficial matriculado en <strong className="text-slate-700">{data.moduleName}</strong>. Monitoreo de regularidad y expedientes académicos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs shadow-2xs">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500">Total:</span>
            <span className="font-mono tabular-nums font-bold text-slate-900">
              {data.totalCount} matriculados
            </span>
          </div>
        </div>
      </div>

      {/* Mensaje de Error si ocurre */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-2xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Tabla Densa de Estudiantes con Filtros de Regularidad */}
      <ActiveStudentsTable
        students={data.students}
        totalCount={data.totalCount}
        currentPage={data.page}
        totalPages={data.totalPages}
        limit={data.limit}
        onPageChange={handlePageChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onViewDossier={handleOpenDossier}
        isLoading={isFetching}
      />

      {/* Drawer Lateral Deslizante de Expediente de Asistencia */}
      <StudentDossierDrawer
        student={selectedStudent}
        isOpen={isDossierOpen}
        onClose={handleCloseDossier}
      />
    </div>
  );
}
