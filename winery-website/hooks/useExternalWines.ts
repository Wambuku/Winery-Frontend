import { useState, useEffect } from 'react';
import { Wine } from '../types';

interface UseExternalWinesResult {
  wines: Wine[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  syncWines: () => Promise<{ synced: number; errors: string[] } | null>;
}

interface UseExternalWinesOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  inStock?: boolean;
}

export function useExternalWines(options: UseExternalWinesOptions = {}): UseExternalWinesResult {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWines = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build URL with parameters
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      if (options.inStock !== undefined) params.append('inStock', options.inStock.toString());
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const response = await fetch(`/api/wines/external${queryString}`);
      const result = await response.json();

      if (result.success) {
        setWines(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch wines');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const syncWines = async () => {
    try {
      const response = await fetch('/api/wines/external?action=sync', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        // Refresh the wines list after sync
        await fetchWines();
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Sync failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
      return null;
    }
  };

  useEffect(() => {
    fetchWines();
  }, []);

  return {
    wines,
    loading,
    error,
    refetch: fetchWines,
    syncWines,
  };
}

export default useExternalWines;