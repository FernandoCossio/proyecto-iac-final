'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, CalendarCheck, History, LogOut } from 'lucide-react';
import { LogoutConfirmButton } from '@/features/auth/components/LogoutConfirmButton';

export interface StudentNavbarProps {
  student: {
    fullName: string;
    registrationNumber: string;
  };
  onLogout: () => void;
  className?: string;
}

export const StudentNavbar: React.FC<StudentNavbarProps> = ({
  student,
  onLogout,
  className = '',
}) => {
  const pathname = usePathname();

  const isTodayActive = pathname === '/asistencia';
  const isHistoryActive = pathname === '/historial';

  return (
    <header
      className={`sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-xs transition-colors ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-2">
        {/* Lado Izquierdo: Isotipo y Denominación Institucional */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-tight leading-tight">
              Control de Asistencia
            </span>
            <span className="text-[10px] text-slate-400 font-medium leading-none hidden sm:inline">
              Postgrado & Ed. Continua
            </span>
          </div>
        </div>

        {/* Centro: Pestañas de Navegación (Sólo Desktop md:flex, en Móvil van en StudentBottomNav) */}
        <nav
          aria-label="Navegación del estudiante"
          className="hidden md:flex items-center gap-1.5"
        >
          <Link
            href="/asistencia"
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isTodayActive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4 shrink-0" />
            <span>Marcación Hoy</span>
          </Link>

          <Link
            href="/historial"
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isHistoryActive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4 shrink-0" />
            <span>Mi Historial</span>
          </Link>
        </nav>

        {/* Lado Derecho: Chip de Identidad del Alumno y Cierre de Sesión */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex flex-col text-right max-w-[130px] sm:max-w-[200px]">
            <span className="text-xs font-semibold text-white truncate">
              {student.fullName}
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-medium tracking-tight">
              {student.registrationNumber}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-800" aria-hidden="true" />

          <LogoutConfirmButton role="STUDENT" redirectTo="/login">
            <button
              type="button"
              className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-rose-500/40"
              title="Cerrar sesión"
              aria-label="Cerrar sesión institucional"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium hidden sm:inline">Salir</span>
            </button>
          </LogoutConfirmButton>
        </div>
      </div>
    </header>
  );
};
