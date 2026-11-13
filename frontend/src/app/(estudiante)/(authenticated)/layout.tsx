'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useStudentAuth } from '@/features/auth/hooks/useStudentAuth';
import { StudentNavbar } from '@/components/layout/StudentNavbar';
import { StudentBottomNav } from '@/components/layout/StudentBottomNav';

export default function AuthenticatedStudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { student, isLoading, logout } = useStudentAuth();

  useEffect(() => {
    if (!isLoading && !student) {
      router.replace('/login');
    }
  }, [isLoading, student, router]);

  if (isLoading || !student) {
    return (
      <main className="min-h-screen bg-slate-50/60 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-700">
            Verificando sesión del estudiante...
          </span>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Cabecera institucional persistente (Navbar) */}
      <StudentNavbar student={student} onLogout={logout} />

      {/* 2. Área central de contenido con padding adaptativo */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 md:pb-10">
        {children}
      </main>

      {/* 3. Barra de navegación inferior móvil (< 768px) */}
      <StudentBottomNav />

      {/* 4. Sistema de notificaciones flotantes con Sonner */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
