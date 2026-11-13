'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useStudentAuth } from '../hooks/useStudentAuth';
import { ApiClientError } from '../../../lib/api-client';
import { AuthRoleSwitcher } from './AuthRoleSwitcher';
import {
  GraduationCap,
  User,
  ShieldCheck,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export function StudentLoginForm() {
  const router = useRouter();
  const { login } = useStudentAuth();

  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reiniciar estado y valores al montar el formulario (evita estados congelados tras logout)
  useEffect(() => {
    setIdentifier('');
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      toast.error('Campo requerido', {
        description:
          'Por favor ingrese su Cédula de Identidad, Matrícula o Correo institucional.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(cleanIdentifier);
      const studentName = data.student.fullName || 'Estudiante';

      toast.success(`¡Bienvenido, ${studentName}!`, {
        description: 'Acceso verificado. Redirigiendo al sistema...',
      });

      // Tiempo de retroalimentación antes de la redirección
      setTimeout(() => {
        setIsLoading(false);
        router.push('/asistencia');
      }, 700);
    } catch (err: unknown) {
      let errorMsg = 'Ocurrió un error inesperado al conectar con el servidor.';
      if (err instanceof ApiClientError) {
        if (
          err.code === 'STUDENT_NOT_FOUND' ||
          err.code === 'NOT_FOUND' ||
          err.code === 'INVALID_CREDENTIALS'
        ) {
          errorMsg =
            'La matrícula o cédula ingresada no se encuentra activa en el módulo actual. Por favor contacte a coordinación.';
        } else {
          errorMsg =
            err.message ||
            'No fue posible validar sus credenciales. Intente nuevamente.';
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMsg = String((err as { message: string }).message);
      }

      toast.error('Error de autenticación', {
        description: errorMsg,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-sm ring-1 ring-slate-900/5 rounded-2xl border-t-4 border-t-emerald-600 p-8 sm:p-10 transition-all">
      {/* 1. Selector de Rol Segmentado */}
      <AuthRoleSwitcher activeRole="STUDENT" />

      {/* Encabezado y Emblema Institucional */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xs mb-4">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-center">
          Acceso de Estudiantes
        </h1>
        <p className="text-sm text-slate-600 text-center mt-1.5 leading-relaxed">
          Consulta de expediente académico y registro transaccional de asistencia.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="student-identifier"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Cédula de Identidad, Matrícula o Correo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
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
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-medium transition disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando matrícula en módulo activo...</span>
            </>
          ) : (
            <>
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Acceso sin contraseña mediante el padrón del módulo activo.</span>
        </div>

        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-xs text-slate-500">
            ¿Eres coordinador o personal administrativo?{' '}
            <Link
              href="/admin/login"
              className="font-bold text-slate-800 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Acceder a Administración</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default StudentLoginForm;
