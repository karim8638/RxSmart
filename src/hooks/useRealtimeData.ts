import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtime } from './useRealtime';
import { useLocalStorage } from './useLocalStorage';

interface UseRealtimeDataOptions<T> {
  table: string;
  select?: string;
  filter?: any;
  orderBy?: { column: string; ascending?: boolean };
  cacheKey?: string;
  enabled?: boolean;
}

export const useRealtimeData = <T>({
  table,
  select = '*',
  filter,
  orderBy,
  cacheKey,
  enabled = true,
}: UseRealtimeDataOptions<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache data locally
  const [cachedData, setCachedData] = useLocalStorage({
    key: cacheKey || `cache_${table}`,
    defaultValue: [] as T[],
  });

  // Initial data fetch
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(table).select(select);

      // Apply filters
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(fetchedData || []);
      setCachedData(fetchedData || []);
    } catch (err) {
      console.error(`Error fetching ${table}:`, err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Use cached data if available
      if (cachedData.length > 0) {
        setData(cachedData);
      }
    } finally {
      setLoading(false);
    }
  }, [table, select, filter, orderBy, enabled, cachedData, setCachedData]);

  // Real-time handlers
  const handleInsert = useCallback((payload: any) => {
    const newRecord = payload.new as T;
    setData(prevData => {
      const updatedData = [...prevData, newRecord];
      setCachedData(updatedData);
      return updatedData;
    });
  }, [setCachedData]);

  const handleUpdate = useCallback((payload: any) => {
    const updatedRecord = payload.new as T;
    const recordId = (updatedRecord as any).id;
    
    setData(prevData => {
      const updatedData = prevData.map(item => 
        (item as any).id === recordId ? updatedRecord : item
      );
      setCachedData(updatedData);
      return updatedData;
    });
  }, [setCachedData]);

  const handleDelete = useCallback((payload: any) => {
    const deletedId = payload.old.id;
    
    setData(prevData => {
      const updatedData = prevData.filter(item => (item as any).id !== deletedId);
      setCachedData(updatedData);
      return updatedData;
    });
  }, [setCachedData]);

  // Set up real-time subscription
  useRealtime({
    table,
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  });

  // Initial fetch
  useEffect(() => {
    // Load cached data immediately
    if (cachedData.length > 0) {
      setData(cachedData);
      setLoading(false);
    }
    
    fetchData();
  }, [fetchData, cachedData]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};