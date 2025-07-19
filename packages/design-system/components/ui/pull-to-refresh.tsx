'use client';

import { RefreshCw, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  canRefresh: boolean;
  threshold?: number;
  className?: string;
}

export function PullToRefreshIndicator({
  isPulling,
  isRefreshing,
  pullDistance,
  canRefresh,
  threshold = 80,
  className,
}: PullToRefreshIndicatorProps) {
  if (!isPulling && !isRefreshing) {
    return null;
  }

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180; // Rotate the arrow as user pulls

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-transform duration-200',
        'bg-gradient-to-b from-white via-white to-transparent backdrop-blur-sm',
        isPulling ? 'translate-y-0' : 'translate-y-0',
        className
      )}
      style={{
        height: Math.min(pullDistance + 20, 100),
        transform: `translateY(${isRefreshing ? '0' : Math.max(0, pullDistance - 40)}px)`,
      }}
    >
      <div className="flex flex-col items-center space-y-2 py-4">
        {/* Icon */}
        <div
          className={cn(
            'transition-all duration-200 ease-out',
            canRefresh ? 'text-green-600' : 'text-muted-foreground'
          )}
        >
          {isRefreshing ? (
            <RefreshCw className="h-6 w-6 animate-spin" />
          ) : (
            <ChevronDown 
              className="h-6 w-6 transition-transform duration-200"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          )}
        </div>

        {/* Text */}
        <div className="text-center">
          <p
            className={cn(
              'text-sm font-medium transition-colors duration-200',
              isRefreshing
                ? 'text-blue-600'
                : canRefresh
                ? 'text-green-600'
                : 'text-muted-foreground'
            )}
          >
            {isRefreshing
              ? 'Refreshing...'
              : canRefresh
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-16 h-1 bg-accent rounded-[var(--radius-full)] overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-200 ease-out rounded-[var(--radius-full)]',
              canRefresh ? 'bg-green-500' : 'bg-gray-400'
            )}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface PullToRefreshWrapperProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
  disabled?: boolean;
  className?: string;
}

export function PullToRefreshWrapper({
  children,
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  disabled = false,
  className,
}: PullToRefreshWrapperProps) {
  // This is a placeholder - the actual implementation would use the hook
  // For now, we'll just render the children
  return (
    <div className={cn('relative', className)}>
      {children}
    </div>
  );
}