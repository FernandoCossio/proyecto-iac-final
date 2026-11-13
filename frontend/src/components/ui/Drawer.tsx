'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

const WIDTH_CLASSES = {
  md: 'max-w-md', // ~448px
  lg: 'max-w-lg', // ~512px
  xl: 'max-w-2xl', // ~672px
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'md',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueo de scroll y escucha de tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const widthClass = WIDTH_CLASSES[width] || WIDTH_CLASSES.md;

  const drawerContent = (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* 1. Backdrop oscuro semitransparente */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Panel lateral deslizante derecho */}
      <div
        className={`relative z-10 w-full ${widthClass} bg-white shadow-2xl flex flex-col border-l border-slate-200 transition-transform duration-300 ease-out animate-in slide-in-from-right duration-250`}
      >
        {/* Cabecera del Drawer */}
        <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="overflow-hidden pr-2">
            <h2
              id="drawer-title"
              className="text-base font-bold text-slate-900 truncate"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 focus:outline-hidden transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo con scroll propio */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </div>

        {/* Pie con acciones si se provee */}
        {footer && (
          <div className="p-4 sm:px-6 border-t border-slate-200 bg-slate-50/80 shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};
