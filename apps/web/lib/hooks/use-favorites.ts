'use client';

import { useState, useTransition } from 'react';

export interface FavoriteResult {
  success: boolean;
  error?: string;
  isFavorited?: boolean;
}

export function useFavorites() {
  const [optimisticFavorites, setOptimisticFavorites] = useState<Set<string>>(
    new Set()
  );
  const [isPending, startTransition] = useTransition();

  const toggleFavorite = async (productId: string): Promise<FavoriteResult> => {
    // Optimistic update
    const wasOptimistic = optimisticFavorites.has(productId);
    const newOptimisticSet = new Set(optimisticFavorites);

    if (wasOptimistic) {
      newOptimisticSet.delete(productId);
    } else {
      newOptimisticSet.add(productId);
    }
    setOptimisticFavorites(newOptimisticSet);

    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const response = await fetch('/api/favorites/toggle', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
          });

          const result = await response.json();

          if (!response.ok) {
            // Revert optimistic update on error
            setOptimisticFavorites(optimisticFavorites);
            resolve({
              success: false,
              error: result.error || 'Failed to toggle favorite',
            });
            return;
          }

          // Update with actual server response
          const actualSet = new Set(optimisticFavorites);
          if (result.isFavorited) {
            actualSet.add(productId);
          } else {
            actualSet.delete(productId);
          }
          setOptimisticFavorites(actualSet);

          resolve({
            success: true,
            isFavorited: result.isFavorited,
          });
        } catch (error) {
          // Revert optimistic update on error
          setOptimisticFavorites(optimisticFavorites);
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
          });
        }
      });
    });
  };

  const checkFavorite = async (productId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/favorites/check?productId=${productId}`
      );
      const result = await response.json();

      if (response.ok && result.isFavorited) {
        const newSet = new Set(optimisticFavorites);
        newSet.add(productId);
        setOptimisticFavorites(newSet);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const isFavorited = (productId: string): boolean => {
    return optimisticFavorites.has(productId);
  };

  return {
    toggleFavorite,
    checkFavorite,
    isFavorited,
    isPending,
  };
}
