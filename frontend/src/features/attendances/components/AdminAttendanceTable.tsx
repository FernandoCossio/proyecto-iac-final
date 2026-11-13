import React, { useState, useMemo } from 'react';
import {
  Clock,
  Edit3,
  Search,
  UserCheck,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { MatrixRowItem } from '../types/admin-attendance.types';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface AdminAttendanceTableProps {
  rows: MatrixRowItem[];
  onOpenOverride: (row: MatrixRowItem) => void;
  loading: boolean;
}

export const AdminAttendanceTable: React.FC<AdminAttendanceTableProps> = ({
  rows,
  onOpenOverride,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.studentName.toLowerCase().includes(term) ||
        r.registrationNumber.toLowerCase().includes(term) ||
        r.classDate.includes(term) ||
        (r.remarks && r.remarks.toLowerCase().includes(term)),
    );
  }, [rows, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Barra Superior de la Tabla */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Planilla Detallada de Asistencia
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mostrando <span className="font-mono tabular-nums font-semibold">{filteredRows.length}</span> registros evaluados
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Filtrar por estudiante, CI o fecha..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Contenedor de la Tabla con Sticky Header */}
      <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 shadow-2xs">
            <tr>
              <th className="py-2.5 px-4 w-12 text-center">#</th>
              <th className="py-2.5 px-4">Estudiante</th>
              <th className="py-2.5 px-4">Documento (CI)</th>
              <th className="py-2.5 px-4">Fecha & Horario</th>
              <th className="py-2.5 px-4 text-center">Estado</th>
              <th className="py-2.5 px-4">Hora Marcación</th>
              <th className="py-2.5 px-4">Observación / Justificación</th>
              <th className="py-2.5 px-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Cargando planilla de asistencias...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No se encontraron registros de asistencia para el criterio seleccionado.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={`${row.studentId}_${row.classScheduleId}_${idx}`}
                    className="hover:bg-slate-50/70 transition-colors h-11"
                  >
                    {/* Número Ordinal */}
                    <td className="py-2 px-4 text-center font-mono tabular-nums text-slate-400 text-[11px]">
                      {globalIndex < 10 ? `0${globalIndex}` : globalIndex}
                    </td>

                    {/* Estudiante */}
                    <td className="py-2 px-4 font-semibold text-slate-900 truncate max-w-[200px]">
                      {row.studentName}
                    </td>

                    {/* CI */}
                    <td className="py-2 px-4 font-mono tabular-nums text-slate-700">
                      {row.registrationNumber}
                    </td>

                    {/* Fecha y Horario */}
                    <td className="py-2 px-4 whitespace-nowrap">
                      <div className="font-mono tabular-nums font-medium text-slate-800">
                        {row.classDate}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {row.timeRange}
                      </div>
                    </td>

                    {/* Estado con StatusBadge */}
                    <td className="py-2 px-4 text-center whitespace-nowrap">
                      <StatusBadge status={row.status} size="sm" />
                    </td>

                    {/* Hora de Marcación */}
                    <td className="py-2 px-4 whitespace-nowrap">
                      <div className="font-mono tabular-nums text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{formatTime(row.markedAt)}</span>
                      </div>
                      {row.markedByRole && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                          {row.markedByRole === 'ADMIN' ? (
                            <ShieldAlert className="w-2.5 h-2.5 text-amber-500" />
                          ) : (
                            <UserCheck className="w-2.5 h-2.5 text-indigo-500" />
                          )}
                          Por {row.markedByRole}
                        </span>
                      )}
                    </td>

                    {/* Observaciones */}
                    <td className="py-2 px-4 max-w-xs truncate">
                      {row.remarks ? (
                        <span
                          className="text-xs text-slate-800 truncate block font-medium"
                          title={row.remarks}
                        >
                          {row.remarks}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Sin novedad
                        </span>
                      )}
                    </td>

                    {/* Botón Modificar / Justificar */}
                    <td className="py-2 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenOverride(row)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-colors"
                        title="Modificar o Justificar Asistencia"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Justificar</span>
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
            Página <strong className="font-mono tabular-nums text-slate-800">{currentPage}</strong> de <strong className="font-mono tabular-nums text-slate-800">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 font-semibold disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 font-semibold disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
