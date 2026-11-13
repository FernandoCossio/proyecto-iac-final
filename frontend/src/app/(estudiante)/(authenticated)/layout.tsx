'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
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

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Cabecera institucional persistente (Navbar) */}
      {student && <StudentNavbar student={student} onLogout={logout} />}

      {/* 2. Área central de contenido con children SIEMPRE renderizado dentro de Suspense */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 md:pb-10">
        <Suspense
          fallback={
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
              <p className="text-xs sm:text-sm font-medium text-slate-600">
                Cargando portal del estudiante...
              </p>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>

      {/* 3. Barra de navegación inferior móvil (< 768px) */}
      {student && <StudentBottomNav />}
    </div>
  );
}
