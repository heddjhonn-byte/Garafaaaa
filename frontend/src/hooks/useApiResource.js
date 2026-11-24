import { useCallback, useEffect, useState } from 'react';

export function getErrorMessage(error) {
  return error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Ocurrió un error inesperado.';
}

export default function useApiResource(loader) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const result = await loader();
      setData(result);
      return result;
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      return null;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loader]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, setData, loading, refreshing, error, load };
}
