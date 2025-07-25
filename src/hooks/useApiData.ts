import { useState, useEffect, useCallback } from 'react';
import api from '../config/api';

export const useApiData = (endpoint: string) => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? String(err.response.data.message)
        : 'Erro ao carregar dados';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint, loading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    if (!loading) {
      fetchData();
    }
  }, [fetchData, loading]);

  return { data, loading, error, refetch };
};
