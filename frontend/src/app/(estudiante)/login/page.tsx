'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentLoginForm } from '@/features/auth/components/StudentLoginForm';
import { useStudentAuth } from '@/features/auth/hooks/useStudentAuth';
import { GraduationCap, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';

export default function StudentLoginPage() {
  const router = useRouter();
  const { student, isLoading } = useStudentAuth();

  useEffect(() => {
    if (!isLoading && student) {
      router.replace('/asistencia');
    }
  }, [isLoading, student, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50/60 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-700">
            Comprobando sesión...
          </span>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Cabecera Institucional Sobria */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-emerald-500 transition-colors shrink-0">
              <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-tight text-white block leading-tight">
                Control de Asistencia
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                Portal Oficial del Estudiante
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </Link>
        </div>
      </header>

      {/* 2. Área Central: Formulario Centrado */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-14 flex items-center justify-center">
        <StudentLoginForm />
      </main>

      {/* 3. Pie de Página Institucional */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Registro inmutable y auditado de asistencia académica</span>
          </span>
          <span>© 2026 Dirección de Postgrado y Educación Continua</span>
        </div>
      </footer>
    </div>
  );
}
