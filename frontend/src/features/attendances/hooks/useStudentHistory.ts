'use client';

import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../services/attendance.service';
import { StudentHistoryResponse } from '../types/attendance.types';
import { ApiClientError } from '../../../lib/api-client';

export function useStudentHistory() {
  const [data, setData] = useState<StudentHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await attendanceService.getMyHistory();
      setData(response);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('No fue posible cargar el historial de asistencia.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const refreshHistory = useCallback(() => {
    return fetchHistory(true);
  }, [fetchHistory]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refreshHistory,
  };
}
