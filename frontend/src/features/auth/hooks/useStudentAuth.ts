'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { studentAuthService } from '../services/student-auth.service';
import { StudentProfile, StudentSession } from '../types/auth.types';
import { ApiClientError } from '../../../lib/api-client';

export function useStudentAuth() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [session, setSession] = useState<StudentSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedSession = studentAuthService.getStoredSession();
    if (storedSession) {
      setSession(storedSession);
      setStudent(storedSession.student);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (identifier: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await studentAuthService.login(identifier);
        setSession(response);
        setStudent(response.student);
        router.push('/asistencia');
        return response;
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message);
        } else {
          setError('Ocurrió un error inesperado al intentar ingresar.');
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    studentAuthService.clearSession();
    setSession(null);
    setStudent(null);
    router.push('/login');
  }, [router]);

  return {
    student,
    session,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!student,
  };
}
