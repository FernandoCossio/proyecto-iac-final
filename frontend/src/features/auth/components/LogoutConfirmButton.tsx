'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { studentAuthService } from '../services/student-auth.service';
import { AlertTriangle, LogOut, Loader2 } from 'lucide-react';

interface LogoutConfirmButtonProps {
  role?: 'ADMIN' | 'STUDENT';
  redirectTo?: string;
  className?: string;
  label?: string;
  children?: React.ReactNode;
}

export const LogoutConfirmButton: React.FC<LogoutConfirmButtonProps> = ({
  role = 'ADMIN',
  redirectTo,
  className = '',
  label = 'Cerrar Sesión',
  children,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultRedirect = role === 'ADMIN' ? '/admin/login' : '/login';
  const targetRedirect = redirectTo || defaultRedirect;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (role === 'ADMIN') {
        await authService.logoutAdmin();
      } else {
        studentAuthService.clearSession();
      }
      setIsOpen(false);
      // Hard navigation para limpiar memoria, estados de React, cachés y formularios
      if (typeof window !== 'undefined') {
        window.location.href = targetRedirect;
      } else {
        router.push(targetRedirect);
      }
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = targetRedirect;
      } else {
        router.push(targetRedirect);
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  const modalContent = isOpen && mounted ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={() => !isLoggingOut && setIsOpen(false)}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3
              id="logout-modal-title"
              className="text-base font-bold text-slate-900 tracking-tight"
            >
              ¿Cerrar Sesión?
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Se revocarán los tokens de autenticación activos y deberás ingresar
              nuevamente con tus credenciales.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isLoggingOut}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Cerrando...</span>
              </>
            ) : (
              <span>Confirmar Salida</span>
            )}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {children ? (
        <span onClick={() => setIsOpen(true)} className="contents">
          {children}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={
            className ||
            'px-3.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition flex items-center gap-1.5 cursor-pointer'
          }
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{label}</span>
        </button>
      )}

      {mounted && typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
};
