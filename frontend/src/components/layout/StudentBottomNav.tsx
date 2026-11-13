'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, History } from 'lucide-react';

export interface StudentBottomNavProps {
  className?: string;
}

export const StudentBottomNav: React.FC<StudentBottomNavProps> = ({
  className = '',
}) => {
  const pathname = usePathname();

  const isTodayActive = pathname === '/asistencia';
  const isHistoryActive = pathname === '/historial';

  return (
    <nav
      aria-label="Navegación móvil del estudiante"
      className={`fixed bottom-0 left-0 right-0 z-30 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden flex items-center justify-around px-2 shadow-sm ${className}`}
    >
      {/* Botón Marcación Hoy */}
      <Link
        href="/asistencia"
        className={`flex flex-col items-center justify-center min-w-[120px] h-12 px-3 py-1 rounded-xl transition-all select-none ${
          isTodayActive
            ? 'text-emerald-700 bg-emerald-50/80 font-bold border border-emerald-200/80 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
        }`}
        aria-current={isTodayActive ? 'page' : undefined}
      >
        <CalendarCheck
          className={`w-5 h-5 mb-0.5 shrink-0 ${
            isTodayActive ? 'text-emerald-600' : 'text-slate-500'
          }`}
        />
        <span className="text-[11px] leading-tight">Marcación Hoy</span>
      </Link>

      <div className="h-6 w-px bg-slate-200" aria-hidden="true" />

      {/* Botón Mi Historial */}
      <Link
        href="/historial"
        className={`flex flex-col items-center justify-center min-w-[120px] h-12 px-3 py-1 rounded-xl transition-all select-none ${
          isHistoryActive
            ? 'text-emerald-700 bg-emerald-50/80 font-bold border border-emerald-200/80 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
        }`}
        aria-current={isHistoryActive ? 'page' : undefined}
      >
        <History
          className={`w-5 h-5 mb-0.5 shrink-0 ${
            isHistoryActive ? 'text-emerald-600' : 'text-slate-500'
          }`}
        />
        <span className="text-[11px] leading-tight">Mi Historial</span>
      </Link>
    </nav>
  );
};
