'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader, BreadcrumbItem } from '@/components/layout/AdminHeader';
import { authService } from '@/features/auth/services/auth.service';
import { AuthUser } from '@/features/auth/types/auth.types';
import { ModuleImportService } from '@/features/modules/services/module-import.service';

export default function AdminAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeModule, setActiveModule] = useState<any>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 1. Cargar sesión y verificar autenticación
  const loadSession = useCallback(() => {
    const token = authService.getStoredToken();
    const storedUser = authService.getStoredUser();

    if (!token) {
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setUser(storedUser);

    // Cargar módulo activo
    ModuleImportService.getActiveModule(token)
      .then((mod) => {
        if (mod) setActiveModule(mod);
      })
      .catch(() => {});
  }, [pathname, router]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Cerrar sidebar móvil en cambio de ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // 2. Generación dinámica de Breadcrumbs en español
  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const crumbs: BreadcrumbItem[] = [
      { label: 'Administración', href: '/admin/dashboard' },
    ];

    if (pathname.includes('/admin/dashboard')) {
      crumbs.push({ label: 'Panel General' });
    } else if (pathname.includes('/admin/asistencias')) {
      crumbs.push({ label: 'Matriz de Asistencias' });
    } else if (pathname.includes('/admin/estudiantes')) {
      crumbs.push({ label: 'Directorio de Alumnos' });
    } else if (pathname.includes('/admin/modulo/importar/fechas')) {
      crumbs.push({ label: 'Carga de Módulo', href: '/admin/modulo/importar' });
      crumbs.push({ label: 'Paso 2: Calendario' });
    } else if (pathname.includes('/admin/modulo/preview')) {
      crumbs.push({ label: 'Carga de Módulo', href: '/admin/modulo/importar' });
      crumbs.push({ label: 'Paso 3: Activación' });
    } else if (pathname.includes('/admin/modulo/importar')) {
      crumbs.push({ label: 'Carga de Módulo' });
      crumbs.push({ label: 'Paso 1: Nómina' });
    } else if (pathname.includes('/admin/auditoria')) {
      crumbs.push({ label: 'Bitácora de Auditoría' });
    } else {
      crumbs.push({ label: 'Gestión' });
    }

    return crumbs;
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex">
      {/* Barra lateral fija (3 niveles responsive) */}
      <AdminSidebar
        currentPath={pathname}
        activeModule={activeModule}
        user={
          user
            ? {
                name: user.username,
                email: user.email,
                role: user.role,
              }
            : null
        }
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Contenedor principal con margen izquierdo adaptativo */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-18 lg:pl-64 transition-all duration-300">
        {/* Cabecera pegada con breadcrumbs y estado */}
        <AdminHeader
          breadcrumbs={breadcrumbs}
          activeModuleName={activeModule?.name}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

        {/* Canvas de contenido de la vista activa */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
