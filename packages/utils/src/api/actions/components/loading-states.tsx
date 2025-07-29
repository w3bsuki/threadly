'use client';

import { cn } from '@repo/ui/lib/utils';
import type React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
  };

  return (
    <div
      aria-label="Loading"
      className={cn(
        'animate-spin rounded-full border-gray-200 border-t-blue-600',
        sizeClasses[size],
        className
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div
      aria-label="Loading"
      className={cn('flex space-x-1', className)}
      role="status"
    >
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-gray-200',
        animate && 'animate-pulse',
        className
      )}
    />
  );
}

interface LoadingOverlayProps {
  show: boolean;
  children: React.ReactNode;
  spinner?: boolean;
  blur?: boolean;
  className?: string;
}

export function LoadingOverlay({
  show,
  children,
  spinner = true,
  blur = true,
  className,
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {show && (
        <div
          className={cn(
            'absolute inset-0 z-50 flex items-center justify-center',
            blur && 'backdrop-blur-sm',
            'bg-white/50'
          )}
        >
          {spinner && <Spinner size="lg" />}
        </div>
      )}
    </div>
  );
}

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText = 'Loading...',
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center',
        loading && 'cursor-not-allowed opacity-70',
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <Spinner
          className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2"
          size="sm"
        />
      )}
      <span className={cn(loading && 'invisible')}>{children}</span>
      {loading && loadingText && (
        <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2">
          {loadingText}
        </span>
      )}
    </button>
  );
}

// Skeleton Components for common UI patterns
export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Skeleton className="mb-4 aspect-square w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-2 h-4 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td className="p-4" key={i}>
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
