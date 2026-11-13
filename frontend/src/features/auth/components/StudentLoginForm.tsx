'use client';

import React, { useState } from 'react';
import { useStudentAuth } from '../hooks/useStudentAuth';
import { GraduationCap, AlertCircle, ArrowRight, Loader2, ShieldCheck, Info } from 'lucide-react';

export interface StudentLoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function StudentLoginForm({ className = '' }: StudentLoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, isLoading, error } = useStudentAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setLocalError('Por favor ingrese su número de cédula, matrícula o correo institucional.');
      return;
    }

    try {
      await login(trimmed);
    } catch {
      // El error ya se gestiona y propaga en useStudentAuth
    }
  };

  const displayedError = localError || error;

  return (
    <div
      className={`w-full max-w-md bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 transition-all ${className}`}
    >
      {/* Encabezado Institucional del Formulario */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3 shadow-2xs">
          <GraduationCap className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 mb-1.5">
          Portal Oficial
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Acceso de Estudiantes
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Registro transaccional de asistencia y consulta de expediente académico.
        </p>
      </div>

      {displayedError && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="font-medium leading-relaxed">{displayedError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="student-identifier"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Cédula de Identidad, Matrícula o Correo
          </label>
          <input
            id="student-identifier"
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            autoFocus
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Ej. 6543210 o alumno@postgrado.edu"
            disabled={isLoading}
            className={`w-full h-12 px-3.5 rounded-lg border text-slate-900 placeholder-slate-400 bg-slate-50/70 focus:bg-white focus:outline-hidden focus:ring-2 transition text-sm font-medium ${
              displayedError
                ? 'border-rose-400 focus:ring-rose-200'
                : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-600'
            } disabled:bg-slate-100 disabled:cursor-not-allowed`}
          />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Acceso sin contraseña mediante el padrón del módulo activo.</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando matrícula en módulo activo...</span>
            </>
          ) : (
            <>
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Si su matrícula no figura en el padrón, contacte a la coordinación de postgrado para validar su inscripción.
          </p>
        </div>
      </div>
    </div>
  );
}
