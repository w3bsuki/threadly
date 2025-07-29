'use client';

import { Skeleton } from '@repo/ui/components';
import { cn } from '@repo/ui/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingState({
  type = 'spinner',
  size = 'md',
  className,
  text,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  if (type === 'skeleton') {
    return <Skeleton className={cn('h-4 w-full', className)} />;
  }

  if (type === 'overlay') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
        <div className="flex flex-col items-center space-y-4 rounded-[var(--radius-lg)] bg-background p-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          {text && <p className="text-muted-foreground">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2
        className={cn('animate-spin text-muted-foreground', sizeClasses[size])}
      />
      {text && (
        <span className="ml-2 text-muted-foreground text-sm">{text}</span>
      )}
    </div>
  );
}

export function ProgressBar({
  value = 0,
  max = 100,
  className,
}: {
  value?: number;
  max?: number;
  className?: string;
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn(
        'h-2 w-full rounded-[var(--radius-full)] bg-accent',
        className
      )}
    >
      <div
        className="h-2 rounded-[var(--radius-full)] bg-blue-600 transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function Spinner({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-muted-foreground',
        sizeClasses[size],
        className
      )}
    />
  );
}
