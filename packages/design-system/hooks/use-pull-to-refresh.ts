'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
  disabled?: boolean;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  canRefresh: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  disabled = false,
}: PullToRefreshOptions) {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    canRefresh: false,
  });

  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || state.isRefreshing) return;
    
    // Only enable pull-to-refresh when at the top of the page
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 0) return;

    touchStartY.current = e.touches[0]?.clientY ?? 0;
    touchCurrentY.current = e.touches[0]?.clientY ?? 0;
  }, [disabled, state.isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || state.isRefreshing) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 0) return;

    touchCurrentY.current = e.touches[0]?.clientY ?? 0;
    const pullDistance = Math.max(0, touchCurrentY.current - touchStartY.current);

    if (pullDistance > 0) {
      // Prevent default scrolling when pulling down
      e.preventDefault();
      
      // Apply resistance to make pulling feel natural
      const resistedDistance = pullDistance / resistance;
      const canRefresh = resistedDistance >= threshold;

      setState({
        isPulling: true,
        isRefreshing: false,
        pullDistance: resistedDistance,
        canRefresh,
      });
    }
  }, [disabled, state.isRefreshing, threshold, resistance]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || state.isRefreshing) return;

    if (state.canRefresh) {
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false,
      }));

      try {
        await onRefresh();
      } catch (error) {
      } finally {
        setState({
          isPulling: false,
          isRefreshing: false,
          pullDistance: 0,
          canRefresh: false,
        });
      }
    } else {
      setState({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        canRefresh: false,
      });
    }
  }, [disabled, state.canRefresh, state.isRefreshing, onRefresh]);

  const setupEventListeners = useCallback((element: HTMLElement) => {
    containerRef.current = element;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('touchstart', handleTouchStart);
        containerRef.current.removeEventListener('touchmove', handleTouchMove);
        containerRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ...state,
    setupEventListeners,
    containerRef,
  };
}