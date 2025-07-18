'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface OptimisticUpdateConfig<T> {
  updateFn: (data: T) => Promise<T>;
  rollbackFn?: (data: T) => T;
  onError?: (error: Error, data: T) => void;
  onSuccess?: (data: T) => void;
  timeout?: number;
}

export function useOptimisticUpdate<T>(
  initialData: T,
  config: OptimisticUpdateConfig<T>
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const rollbackRef = useRef<T | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const update = useCallback(async (optimisticData: T) => {
    setIsLoading(true);
    setError(null);
    
    rollbackRef.current = data;
    setData(optimisticData);

    const timeout = config.timeout ?? 5000;
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, timeout);
      });

      const result = await Promise.race([
        config.updateFn(optimisticData),
        timeoutPromise
      ]);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setData(result);
      config.onSuccess?.(result);
      rollbackRef.current = null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (rollbackRef.current) {
        const rollbackData = config.rollbackFn 
          ? config.rollbackFn(rollbackRef.current)
          : rollbackRef.current;
        setData(rollbackData);
      }
      
      config.onError?.(error, optimisticData);
    } finally {
      setIsLoading(false);
    }
  }, [data, config]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    update,
    rollback: () => {
      if (rollbackRef.current) {
        setData(rollbackRef.current);
        rollbackRef.current = null;
      }
    }
  };
}

export function useOptimisticList<T extends { id: string }>(
  initialList: T[],
  config: {
    addFn: (item: T) => Promise<T>;
    updateFn: (item: T) => Promise<T>;
    deleteFn: (id: string) => Promise<void>;
    onError?: (error: Error, operation: string, data?: T) => void;
    timeout?: number;
  }
) {
  const [items, setItems] = useState<T[]>(initialList);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, Error>>(new Map());
  const rollbackRef = useRef<Map<string, T | null>>(new Map());

  const addItem = useCallback(async (item: T) => {
    const tempId = `temp-${Date.now()}`;
    const tempItem = { ...item, id: tempId };
    
    setItems(prev => [...prev, tempItem]);
    setLoadingIds(prev => new Set(prev).add(tempId));
    
    try {
      const result = await config.addFn(item);
      setItems(prev => prev.map(i => i.id === tempId ? result : i));
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setItems(prev => prev.filter(i => i.id !== tempId));
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
      setErrors(prev => new Map(prev).set(tempId, error));
      config.onError?.(error, 'add', item);
    }
  }, [config]);

  const updateItem = useCallback(async (item: T) => {
    setLoadingIds(prev => new Set(prev).add(item.id));
    rollbackRef.current.set(item.id, items.find(i => i.id === item.id) || null);
    
    setItems(prev => prev.map(i => i.id === item.id ? item : i));
    
    try {
      const result = await config.updateFn(item);
      setItems(prev => prev.map(i => i.id === item.id ? result : i));
      rollbackRef.current.delete(item.id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const rollbackItem = rollbackRef.current.get(item.id);
      if (rollbackItem) {
        setItems(prev => prev.map(i => i.id === item.id ? rollbackItem : i));
      }
      setErrors(prev => new Map(prev).set(item.id, error));
      config.onError?.(error, 'update', item);
    } finally {
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  }, [items, config]);

  const deleteItem = useCallback(async (id: string) => {
    const itemToDelete = items.find(i => i.id === id);
    if (!itemToDelete) return;

    setLoadingIds(prev => new Set(prev).add(id));
    rollbackRef.current.set(id, itemToDelete);
    setItems(prev => prev.filter(i => i.id !== id));
    
    try {
      await config.deleteFn(id);
      rollbackRef.current.delete(id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setItems(prev => [...prev, itemToDelete]);
      setErrors(prev => new Map(prev).set(id, error));
      config.onError?.(error, 'delete', itemToDelete);
    } finally {
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [items, config]);

  const clearError = useCallback((id: string) => {
    setErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  return {
    items,
    loadingIds,
    errors,
    addItem,
    updateItem,
    deleteItem,
    clearError,
    isLoading: (id: string) => loadingIds.has(id),
    getError: (id: string) => errors.get(id)
  };
}

export function createOptimisticAction<T, R>(
  action: (data: T) => Promise<R>,
  options: {
    optimisticUpdate?: (data: T) => void;
    rollback?: (data: T) => void;
    onError?: (error: Error, data: T) => void;
    onSuccess?: (result: R, data: T) => void;
  } = {}
) {
  return async (data: T): Promise<R> => {
    try {
      options.optimisticUpdate?.(data);
      const result = await action(data);
      options.onSuccess?.(result, data);
      return result;
    } catch (error) {
      options.rollback?.(data);
      const err = error instanceof Error ? error : new Error(String(error));
      options.onError?.(err, data);
      throw err;
    }
  };
}