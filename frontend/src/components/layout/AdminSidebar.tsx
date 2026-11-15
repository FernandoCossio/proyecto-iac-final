'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  LayoutDashboard,
  CalendarCheck2,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  Server,
  PlusCircle,
  X,
} from 'lucide-react';
import { LogoutConfirmButton } from '@/features/auth/components/LogoutConfirmButton';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface AdminSidebarProps {
  currentPath: string;
  activeModule?: {
    code: string;
    name: string;
    period?: string;
  } | null;
  user?: {
    name: string;
    email: string;
    role?: string;
  } | null;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'OPERACIONES',
    items: [
      {
        label: 'Panel General',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'Matriz de Asistencias',
        href: '/admin/asistencias',
        icon: CalendarCheck2,
      },
    ],
  },
  {
    title: 'ACADÉMICO',
    items: [
      {
        label: 'Directorio de Alumnos',
        href: '/admin/estudiantes',
        icon: Users,
      },
    ],
  },
  {
    title: 'ADMINISTRACIÓN',
    items: [
      {
        label: 'Carga de Módulo',
        href: '/admin/modulo/importar',
        icon: FileSpreadsheet,
      },
      {
        label: 'Bitácora de Auditoría',
        href: '/admin/auditoria',
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: 'CONTROL PLANE (IAC)',
    items: [
      {
        label: 'Plataforma de Tenants',
        href: '/admin/tenants',
        icon: Server,
      },
      {
        label: 'Crear Tenant',
        href: '/admin/tenants/crear',
        icon: PlusCircle,
      },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPath,
  activeModule,
  user,
  isMobileOpen,
  onCloseMobile,
}) => {
  // Escucha tecla Escape para cerrar en móvil
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  const isItemActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return currentPath === '/admin/dashboard';
    }
    return currentPath.startsWith(href);
  };

  return (
    <>
      {/* 1. Backdrop oscurecido para vista móvil (< 780px) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* 2. Contenedor del Sidebar con 3 niveles adaptativos */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out
          ${
            isMobileOpen
              ? 'translate-x-0 w-64 shadow-2xl'
              : '-translate-x-full md:translate-x-0 md:w-18 lg:w-64'
          }`}
      >
        {/* Cabecera institucional del Sidebar */}
        <div className="h-14 border-b border-slate-800 flex items-center justify-between px-3.5 lg:px-4 shrink-0">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2.5 focus:outline-hidden group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-indigo-500 transition-colors">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <span className="text-xs font-bold text-white block leading-tight tracking-tight">
                Control de Asistencia
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight truncate">
                Postgrado & Ed. Continua
              </span>
            </div>
          </Link>

          {/* Botón de cierre visible únicamente en móvil */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-hidden"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menú de Navegación Vertical */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              {/* Título de grupo (oculto en tablet w-18) */}
              <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400/90 hidden lg:block">
                {group.title}
              </div>

              {group.items.map((item) => {
                const active = isItemActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (isMobileOpen) onCloseMobile();
                    }}
                    title={item.label}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative
                      ${
                        active
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }
                      md:justify-center lg:justify-start`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate md:hidden lg:inline">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="ml-auto px-1.5 py-0.5 text-[10px] font-mono rounded-full bg-slate-800 text-slate-300 md:hidden lg:inline">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Pie del Sidebar: Perfil de Usuario y Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5 mb-2.5 md:justify-center lg:justify-start">
            <div
              className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 font-mono"
              title={user?.email || 'admin@postgrado.edu'}
            >
              {initials}
            </div>
            <div className="hidden lg:block overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">
                {user?.name || 'Coordinador Académico'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {user?.email || 'admin@postgrado.edu'}
              </div>
            </div>
          </div>

          <div className="md:hidden lg:block">
            <LogoutConfirmButton
              role="ADMIN"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-rose-300 bg-slate-800/80 hover:bg-rose-950/40 rounded-lg border border-slate-700/60 hover:border-rose-900/60 transition-colors"
              label="Cerrar Sesión"
            />
          </div>
        </div>
      </aside>
    </>
  );
};
