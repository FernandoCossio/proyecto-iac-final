'use client';

import React, { useState, useMemo } from 'react';
import { StudentItem } from '../types/student.types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Users,
  Search,
  Filter,
  FileText,
  ChevronLeft,
  ChevronRight,
  Mail,
  Loader2,
} from 'lucide-react';

interface ActiveStudentsTableProps {
  students: StudentItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onViewDossier: (student: StudentItem) => void;
  isLoading?: boolean;
}

type RegularityFilter = 'ALL' | 'REGULAR' | 'EN_RIESGO' | 'REPROBADO';

export const ActiveStudentsTable: React.FC<ActiveStudentsTableProps> = ({
  students,
  totalCount,
  currentPage,
  totalPages,
  limit,
  onPageChange,
  searchTerm = '',
  onSearchChange,
  onViewDossier,
  isLoading = false,
}) => {
  const [selectedRegularity, setSelectedRegularity] =
    useState<RegularityFilter>('ALL');

  // Filtrado local por regularidad si aplica
  const filteredStudents = useMemo(() => {
    if (selectedRegularity === 'ALL') return students;
    return students.filter((st) => {
      // Cálculo o estimación si el backend no envía el campo explícito
      const pct = (st as any).attendancePercentage ?? 85;
      if (selectedRegularity === 'REGULAR') return pct >= 80;
      if (selectedRegularity === 'EN_RIESGO') return pct >= 70 && pct < 80;
      if (selectedRegularity === 'REPROBADO') return pct < 70;
      return true;
    });
  }, [students, selectedRegularity]);

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda Rápida */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filtros de Regularidad */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            Condición:
          </span>
          <button
            type="button"
            onClick={() => setSelectedRegularity('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              selectedRegularity === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedRegularity('REGULAR')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              selectedRegularity === 'REGULAR'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Regulares (≥80%)
          </button>
          <button
            type="button"
            onClick={() => setSelectedRegularity('EN_RIESGO')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              selectedRegularity === 'EN_RIESGO'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            En Riesgo (70-79%)
          </button>
          <button
            type="button"
            onClick={() => setSelectedRegularity('REPROBADO')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              selectedRegularity === 'REPROBADO'
                ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            Reprobados (&lt;70%)
          </button>
        </div>

        {/* Buscador Rápido con Icono */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Buscar por cédula o nombre..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/60 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Tabla de Alumnos de Alta Densidad */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 w-12 text-center">#</th>
                <th className="py-2.5 px-4">Documento (CI)</th>
                <th className="py-2.5 px-4">Estudiante</th>
                <th className="py-2.5 px-4">Correo Institucional</th>
                <th className="py-2.5 px-4 text-center">Regularidad</th>
                <th className="py-2.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Cargando padrón de estudiantes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron estudiantes que coincidan con el filtro aplicado.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const globalIdx = (currentPage - 1) * limit + idx + 1;
                  const pct = (st as any).attendancePercentage ?? 85.0;
                  let status = 'REGULAR';
                  if (pct < 70) status = 'REPROBADO';
                  else if (pct < 80) status = 'EN_RIESGO';

                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-slate-50/70 transition-colors h-11"
                    >
                      {/* # */}
                      <td className="py-2 px-4 text-center font-mono tabular-nums text-slate-400 text-[11px]">
                        {globalIdx < 10 ? `0${globalIdx}` : globalIdx}
                      </td>

                      {/* CI */}
                      <td className="py-2 px-4 font-mono tabular-nums font-semibold text-slate-800">
                        {st.registrationNumber}
                      </td>

                      {/* Nombre con Avatar de Iniciales */}
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
                            {st.fullName
                              .split(' ')
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900 truncate max-w-[220px]">
                            {st.fullName}
                          </span>
                        </div>
                      </td>

                      {/* Correo */}
                      <td className="py-2 px-4 text-slate-500 font-mono text-[11px]">
                        {st.email}
                      </td>

                      {/* Regularidad & Badge */}
                      <td className="py-2 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <StatusBadge status={status} size="sm" />
                          <span className="font-mono tabular-nums text-slate-700 font-bold text-xs">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      {/* Acción Expediente */}
                      <td className="py-2 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onViewDossier(st)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-colors"
                          title="Inspeccionar historial sesión por sesión"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Expediente</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/60">
            <span>
              Mostrando <strong className="font-mono tabular-nums text-slate-800">{startItem}</strong> a <strong className="font-mono tabular-nums text-slate-800">{endItem}</strong> de <strong className="font-mono tabular-nums text-slate-800">{totalCount}</strong> estudiantes
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 font-semibold disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 font-semibold disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
