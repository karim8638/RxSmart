import { useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface UseAutoSaveOptions<T> {
  key: string;
  data: T;
  delay?: number;
  onSave?: (data: T) => void;
  onRestore?: (data: T) => void;
}

export const useAutoSave = <T>({
  key,
  data,
  delay = 1000,
  onSave,
  onRestore,
}: UseAutoSaveOptions<T>) => {
  const [savedData, setSavedData, removeSavedData] = useLocalStorage({
    key: `autosave_${key}`,
    defaultValue: null as T | null,
  });
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  // Auto-save data with debouncing
  useEffect(() => {
    const dataString = JSON.stringify(data);
    
    // Only save if data has actually changed
    if (dataString !== lastSavedRef.current && data !== null && data !== undefined) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        setSavedData(data);
        lastSavedRef.current = dataString;
        onSave?.(data);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, setSavedData, onSave]);

  // Restore saved data
  const restoreData = useCallback(() => {
    if (savedData) {
      onRestore?.(savedData);
      return savedData;
    }
    return null;
  }, [savedData, onRestore]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    removeSavedData();
    lastSavedRef.current = '';
  }, [removeSavedData]);

  // Check if there's saved data available
  const hasSavedData = savedData !== null && savedData !== undefined;

  return {
    savedData,
    restoreData,
    clearSavedData,
    hasSavedData,
  };
};