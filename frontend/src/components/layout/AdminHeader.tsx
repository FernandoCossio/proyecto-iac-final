'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, ChevronRight, RefreshCw, Activity, BookOpen } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  isSystemOnline?: boolean;
  activeModuleName?: string;
  isSyncing?: boolean;
  onSync?: () => void;
  onOpenMobileMenu: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  breadcrumbs,
  isSystemOnline = true,
  activeModuleName,
  isSyncing = false,
  onSync,
  onOpenMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 transition-colors">
      {/* Lado Izquierdo: Botón Menú Móvil + Breadcrumbs */}
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Migas de Pan (Breadcrumbs) en Español */}
        <nav aria-label="Breadcrumb" className="overflow-hidden">
          <ol className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  {idx > 0 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-slate-900 transition-colors font-normal truncate"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={`truncate ${
                        isLast
                          ? 'font-semibold text-slate-900'
                          : 'font-normal text-slate-600'
                      }`}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Lado Derecho: Estado Operativo + Sincronización */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Badge de Módulo Activo en Pantallas Medianas/Grandes */}
        {activeModuleName && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium max-w-[200px] truncate">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">{activeModuleName}</span>
          </div>
        )}

        {/* Badge de Estado en Vivo del Sistema */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">
            {isSystemOnline ? 'Sistema Operativo' : 'Sin Conexión'}
          </span>
          <Activity className="w-3 h-3 sm:hidden text-emerald-600" />
        </div>

        {/* Botón de Sincronización Manual */}
        {onSync && (
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 focus:outline-hidden transition-all disabled:opacity-50"
            title="Sincronizar información del módulo"
            aria-label="Sincronizar información"
          >
            <RefreshCw
              className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`}
            />
          </button>
        )}
      </div>
    </header>
  );
};
