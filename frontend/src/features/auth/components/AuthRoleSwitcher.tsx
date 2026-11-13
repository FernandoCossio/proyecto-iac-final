'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export interface AuthRoleSwitcherProps {
  activeRole: 'STUDENT' | 'ADMIN';
  className?: string;
}

export function AuthRoleSwitcher({
  activeRole,
  className = '',
}: AuthRoleSwitcherProps) {
  const isStudent = activeRole === 'STUDENT';
  const isAdmin = activeRole === 'ADMIN';

  return (
    <div
      role="tablist"
      aria-label="Seleccionar portal de acceso"
      className={`p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 flex items-center gap-1 w-full mb-6 select-none ${className}`}
    >
      {/* Pestaña: Estudiantes */}
      <Link
        href="/login"
        role="tab"
        aria-selected={isStudent}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          isStudent
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
        }`}
      >
        <GraduationCap className={`w-4 h-4 shrink-0 ${isStudent ? 'text-white' : 'text-slate-500'}`} />
        <span>Estudiantes</span>
      </Link>

      {/* Pestaña: Administración */}
      <Link
        href="/admin/login"
        role="tab"
        aria-selected={isAdmin}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          isAdmin
            ? 'bg-indigo-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
        }`}
      >
        <ShieldCheck className={`w-4 h-4 shrink-0 ${isAdmin ? 'text-white' : 'text-slate-500'}`} />
        <span>Administración</span>
      </Link>
    </div>
  );
}
export default AuthRoleSwitcher;
