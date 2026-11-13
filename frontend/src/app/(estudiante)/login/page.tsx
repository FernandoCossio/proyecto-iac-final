import { Metadata } from 'next';
import Link from 'next/link';
import StudentLoginForm from '@/features/auth/components/StudentLoginForm';
import { GraduationCap, ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Acceso de Estudiantes | Sistema de Control de Asistencia',
  description:
    'Portal de autenticación y registro de asistencia para estudiantes de postgrado.',
};

export default function StudentLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900 relative">
      {/* 1. Barra Superior Institucional */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg px-1 py-0.5"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-emerald-500 transition-colors">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-tight text-white block leading-tight">
                Control de Asistencia
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                Portal de Estudiantes
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Acceso Administrativo</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Inicio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Formulario Centrado */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 flex items-center justify-center">
        <StudentLoginForm />
      </main>

      {/* 3. Pie Institucional */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Acceso sin contraseña mediante el padrón del módulo activo</span>
          </span>
          <span>© 2026 Dirección de Postgrado. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
