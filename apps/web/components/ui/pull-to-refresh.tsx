'use client';

import { cn } from '@repo/design-system/lib/utils';
import { RefreshCw } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

  const threshold = 80;
  const maxPullDistance = 120;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (disabled || isRefreshing) return;

      if (window.scrollY === 0) {
        setTouchStart(e.touches[0].clientY);
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (disabled || isRefreshing || !isPulling) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStart;

      if (distance > 0 && window.scrollY === 0) {
        e.preventDefault();
        const pullDist = Math.min(distance * 0.5, maxPullDistance);
        setPullDistance(pullDist);
      }
    };

    const handleTouchEnd = async () => {
      if (disabled || isRefreshing || !isPulling) return;

      setIsPulling(false);

      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }

      setPullDistance(0);
    };

    document.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, isRefreshing, isPulling, touchStart, pullDistance, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className="absolute top-0 right-0 left-0 flex items-center justify-center transition-all duration-200 ease-out"
        style={{
          height: `${pullDistance}px`,
          transform: `translateY(-${Math.max(0, pullDistance - 40)}px)`,
          opacity: pullDistance > 20 ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center text-muted-foreground">
          <RefreshCw
            className={cn(
              'h-5 w-5 transition-transform duration-200',
              isRefreshing ? 'animate-spin' : ''
            )}
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          />
          <span className="mt-1 text-xs">
            {isRefreshing
              ? 'Refreshing...'
              : pullDistance >= threshold
                ? 'Release to refresh'
                : 'Pull to refresh'}
          </span>
        </div>
      </div>

      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing,
    handleRefresh,
  };
}
