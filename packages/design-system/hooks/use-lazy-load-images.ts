'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
}

export function useLazyLoadImages({
  threshold = 0.1,
  rootMargin = '50px',
  disabled = false,
}: UseLazyLoadOptions = {}) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<Map<string, HTMLElement>>(new Map());

  const observe = useCallback(
    (element: HTMLElement, imageId: string) => {
      if (disabled) return;

      imageRefs.current.set(imageId, element);

      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    },
    [disabled]
  );

  const unobserve = useCallback((imageId: string) => {
    const element = imageRefs.current.get(imageId);
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
      imageRefs.current.delete(imageId);
    }
  }, []);

  useEffect(() => {
    if (disabled) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const newLoadedImages = new Set(loadedImages);
        let hasChanges = false;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Find the image ID from our refs
            for (const [imageId, element] of imageRefs.current.entries()) {
              if (element === entry.target) {
                newLoadedImages.add(imageId);
                hasChanges = true;
                observerRef.current?.unobserve(element);
                imageRefs.current.delete(imageId);
                break;
              }
            }
          }
        });

        if (hasChanges) {
          setLoadedImages(newLoadedImages);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Observe all currently tracked elements
    imageRefs.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin, disabled, loadedImages]);

  const isLoaded = useCallback(
    (imageId: string) => {
      return loadedImages.has(imageId);
    },
    [loadedImages]
  );

  const preloadImages = useCallback((urls: string[]) => {
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  const reset = useCallback(() => {
    setLoadedImages(new Set());
    imageRefs.current.clear();
  }, []);

  return {
    observe,
    unobserve,
    isLoaded,
    preloadImages,
    reset,
    loadedCount: loadedImages.size,
  };
}

// Hook for handling image loading states
export function useImageLoadingState() {
  const [loadingStates, setLoadingStates] = useState<
    Map<string, 'loading' | 'loaded' | 'error'>
  >(new Map());

  const setImageState = useCallback(
    (imageId: string, state: 'loading' | 'loaded' | 'error') => {
      setLoadingStates((prev) => {
        const next = new Map(prev);
        next.set(imageId, state);
        return next;
      });
    },
    []
  );

  const getImageState = useCallback(
    (imageId: string) => {
      return loadingStates.get(imageId) || 'loading';
    },
    [loadingStates]
  );

  const reset = useCallback(() => {
    setLoadingStates(new Map());
  }, []);

  return {
    setImageState,
    getImageState,
    reset,
  };
}

// Virtual list hook for large image galleries
export function useVirtualImageList<
  T extends { id: string; imageUrl: string },
>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex,
  };
}
